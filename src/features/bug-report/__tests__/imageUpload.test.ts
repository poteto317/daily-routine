import {
  deleteObject,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from "firebase/storage";
import { MAX_BUG_REPORT_IMAGE_BYTES } from "../constants";
import { deleteBugReportImages, uploadBugReportImages } from "../imageUpload";

jest.mock("firebase/storage", () => ({
  ref: jest.fn((_storage, path: string) => ({ fullPath: path })),
  uploadBytes: jest.fn(),
  deleteObject: jest.fn(),
}));

const mockedRef = ref as jest.Mock;
const mockedUploadBytes = uploadBytes as jest.Mock;
const mockedDeleteObject = deleteObject as jest.Mock;

const fakeStorage = {} as FirebaseStorage;

function makeFile(name: string, type: string, sizeBytes = 512): File {
  const file = new File([new Uint8Array(1)], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

describe("imageUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUploadBytes.mockResolvedValue({});
    mockedDeleteObject.mockResolvedValue(undefined);
  });

  it("2 枚の画像をアップロードし、path・contentType・size を返す", async () => {
    const f1 = makeFile("a.png", "image/png", 120);
    const f2 = makeFile("b.jpeg", "image/jpeg", 340);
    let seq = 0;
    const createFileId = () => {
      seq += 1;
      return `id-${seq}`;
    };

    const result = await uploadBugReportImages({
      storage: fakeStorage,
      uid: "u1",
      reportId: "r1",
      images: [f1, f2],
      createFileId,
    });

    expect(result).toEqual([
      {
        path: "bugReports/u1/r1/id-1.png",
        contentType: "image/png",
        size: 120,
      },
      {
        path: "bugReports/u1/r1/id-2.jpg",
        contentType: "image/jpeg",
        size: 340,
      },
    ]);
    expect(mockedRef).toHaveBeenNthCalledWith(
      1,
      fakeStorage,
      "bugReports/u1/r1/id-1.png",
    );
    expect(mockedRef).toHaveBeenNthCalledWith(
      2,
      fakeStorage,
      "bugReports/u1/r1/id-2.jpg",
    );
    expect(mockedUploadBytes).toHaveBeenNthCalledWith(
      1,
      { fullPath: "bugReports/u1/r1/id-1.png" },
      f1,
      { contentType: "image/png" },
    );
    expect(mockedUploadBytes).toHaveBeenNthCalledWith(
      2,
      { fullPath: "bugReports/u1/r1/id-2.jpg" },
      f2,
      { contentType: "image/jpeg" },
    );
  });

  it("既定の createFileId は base64url（^[A-Za-z0-9_-]{16,64}$）で呼び出しごとに異なる", async () => {
    const f1 = makeFile("a.png", "image/png");
    const f2 = makeFile("b.png", "image/png");

    const result = await uploadBugReportImages({
      storage: fakeStorage,
      uid: "u1",
      reportId: "r1",
      images: [f1, f2],
    });

    const name1 = result[0]!.path
      .replace("bugReports/u1/r1/", "")
      .replace(".png", "");
    const name2 = result[1]!.path
      .replace("bugReports/u1/r1/", "")
      .replace(".png", "");

    expect(name1).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(name2).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(name1).not.toBe(name2);
  });

  it("2 枚目のアップロードが失敗したとき、成功済みの 1 枚目だけ削除し、元の例外を投げる", async () => {
    const f1 = makeFile("a.png", "image/png");
    const f2 = makeFile("b.png", "image/png");
    const uploadErr = new Error("upload failed on #2");
    mockedUploadBytes
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(uploadErr);
    // 後始末の deleteObject が失敗しても元の例外が伝わることも確かめる
    mockedDeleteObject.mockRejectedValueOnce(new Error("delete failed"));

    let seq = 0;
    await expect(
      uploadBugReportImages({
        storage: fakeStorage,
        uid: "u1",
        reportId: "r1",
        images: [f1, f2],
        createFileId: () => `id-${++seq}`,
      }),
    ).rejects.toBe(uploadErr);

    expect(mockedDeleteObject).toHaveBeenCalledTimes(1);
    expect(mockedDeleteObject).toHaveBeenCalledWith({
      fullPath: "bugReports/u1/r1/id-1.png",
    });
  });

  it("アップロード前の防御検証: 枚数超過・許可外形式・5MB 超・0 バイト以下の場合は uploadBytes を 1 回も呼ばずに例外を投げる", async () => {
    const ok = makeFile("ok.png", "image/png");
    const svg = makeFile("bad.svg", "image/svg+xml");
    const huge = makeFile(
      "huge.png",
      "image/png",
      MAX_BUG_REPORT_IMAGE_BYTES + 1,
    );
    const zeroByte = makeFile("zero.png", "image/png", 0);

    await expect(
      uploadBugReportImages({
        storage: fakeStorage,
        uid: "u1",
        reportId: "r1",
        images: [ok, ok, ok, ok],
      }),
    ).rejects.toThrow();

    await expect(
      uploadBugReportImages({
        storage: fakeStorage,
        uid: "u1",
        reportId: "r1",
        images: [svg],
      }),
    ).rejects.toThrow();

    await expect(
      uploadBugReportImages({
        storage: fakeStorage,
        uid: "u1",
        reportId: "r1",
        images: [huge],
      }),
    ).rejects.toThrow();

    await expect(
      uploadBugReportImages({
        storage: fakeStorage,
        uid: "u1",
        reportId: "r1",
        images: [zeroByte],
      }),
    ).rejects.toThrow();

    expect(mockedUploadBytes).not.toHaveBeenCalled();
  });

  describe("deleteBugReportImages", () => {
    it("すべてのパスに対して deleteObject を呼び、一部が失敗しても例外を投げず残りも削除する", async () => {
      mockedDeleteObject
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockResolvedValueOnce(undefined);

      await expect(
        deleteBugReportImages(fakeStorage, [
          "bugReports/u1/r1/a.png",
          "bugReports/u1/r1/b.png",
        ]),
      ).resolves.toBeUndefined();

      expect(mockedDeleteObject).toHaveBeenCalledTimes(2);
      expect(mockedDeleteObject).toHaveBeenNthCalledWith(1, {
        fullPath: "bugReports/u1/r1/a.png",
      });
      expect(mockedDeleteObject).toHaveBeenNthCalledWith(2, {
        fullPath: "bugReports/u1/r1/b.png",
      });
    });

    it("空配列では deleteObject を呼ばない", async () => {
      await deleteBugReportImages(fakeStorage, []);
      expect(mockedDeleteObject).not.toHaveBeenCalled();
    });
  });
});
