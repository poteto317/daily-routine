import {
  type BucketLike,
  createStorageImageStore,
  type FileLike,
} from "../storageImageStore";

function createFakeBucket(): {
  bucket: BucketLike;
  fileMock: jest.Mock<FileLike, [string]>;
  getMetadata: jest.Mock;
  download: jest.Mock;
  setMetadata: jest.Mock;
} {
  const getMetadata = jest.fn();
  const download = jest.fn();
  const setMetadata = jest.fn().mockResolvedValue([{}]);
  const fileObj: FileLike = {
    getMetadata,
    download,
    setMetadata,
  };
  const fileMock = jest.fn<FileLike, [string]>().mockReturnValue(fileObj);
  const bucket: BucketLike = {
    name: "bucket-1",
    file: fileMock,
  };
  return { bucket, fileMock, getMetadata, download, setMetadata };
}

describe("storageImageStore", () => {
  describe("getSize", () => {
    it("メタデータの size が数値または数値文字列の場合はその数値を返す", async () => {
      const { bucket, fileMock, getMetadata } = createFakeBucket();
      const store = createStorageImageStore(bucket);

      getMetadata.mockResolvedValueOnce([{ size: "1234" }]);
      await expect(store.getSize("bugReports/u1/r1/a.png")).resolves.toBe(1234);
      expect(fileMock).toHaveBeenCalledWith("bugReports/u1/r1/a.png");

      getMetadata.mockResolvedValueOnce([{ size: 5678 }]);
      await expect(store.getSize("bugReports/u1/r1/b.png")).resolves.toBe(5678);
    });

    it("size が undefined・非数値文字列・負数・NaN の場合は null を返す", async () => {
      const { bucket, getMetadata } = createFakeBucket();
      const store = createStorageImageStore(bucket);

      for (const badSize of [undefined, "abc", "", -1, "-5", Number.NaN]) {
        getMetadata.mockResolvedValueOnce([{ size: badSize }]);
        await expect(
          store.getSize("bugReports/u1/r1/a.png"),
        ).resolves.toBeNull();
      }
    });

    it("getMetadata が例外を投げた場合はそのまま例外を投げる", async () => {
      const { bucket, getMetadata } = createFakeBucket();
      const store = createStorageImageStore(bucket);
      getMetadata.mockRejectedValueOnce(new Error("404 Not Found"));

      await expect(store.getSize("bugReports/u1/r1/a.png")).rejects.toThrow(
        "404 Not Found",
      );
    });
  });

  describe("download", () => {
    it("file.download() の先頭 Buffer を返す", async () => {
      const { bucket, fileMock, download } = createFakeBucket();
      const buf = Buffer.from([1, 2, 3]);
      download.mockResolvedValueOnce([buf]);
      const store = createStorageImageStore(bucket);

      const res = await store.download("bugReports/u1/r1/a.png");
      expect(fileMock).toHaveBeenCalledWith("bugReports/u1/r1/a.png");
      expect(res).toBe(buf);
    });
  });

  describe("getDownloadUrl", () => {
    it("firebaseStorageDownloadTokens が既にある場合は先頭トークンを使い setMetadata を呼ばない", async () => {
      const { bucket, getMetadata, setMetadata } = createFakeBucket();
      getMetadata.mockResolvedValueOnce([
        {
          metadata: {
            firebaseStorageDownloadTokens: "tok-a,tok-b",
          },
        },
      ]);
      const store = createStorageImageStore(bucket, () => "unused-token");

      const url = await store.getDownloadUrl("bugReports/u1/r1/a.png");
      expect(url).toBe(
        "https://firebasestorage.googleapis.com/v0/b/bucket-1/o/bugReports%2Fu1%2Fr1%2Fa.png?alt=media&token=tok-a",
      );
      expect(setMetadata).not.toHaveBeenCalled();
    });

    it("トークンが無い（metadata 未設定または空文字）場合は generateToken で生成して setMetadata を呼び URL を返す", async () => {
      const { bucket, getMetadata, setMetadata } = createFakeBucket();
      getMetadata
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([
          { metadata: { firebaseStorageDownloadTokens: "  " } },
        ]);
      let counter = 0;
      const store = createStorageImageStore(bucket, () => {
        counter += 1;
        return `gen-token-${counter}`;
      });

      const url1 = await store.getDownloadUrl("bugReports/u1/r1/a.png");
      expect(url1).toBe(
        "https://firebasestorage.googleapis.com/v0/b/bucket-1/o/bugReports%2Fu1%2Fr1%2Fa.png?alt=media&token=gen-token-1",
      );
      expect(setMetadata).toHaveBeenNthCalledWith(1, {
        metadata: { firebaseStorageDownloadTokens: "gen-token-1" },
      });

      const url2 = await store.getDownloadUrl("bugReports/u1/r1/b.png");
      expect(url2).toBe(
        "https://firebasestorage.googleapis.com/v0/b/bucket-1/o/bugReports%2Fu1%2Fr1%2Fb.png?alt=media&token=gen-token-2",
      );
      expect(setMetadata).toHaveBeenNthCalledWith(2, {
        metadata: { firebaseStorageDownloadTokens: "gen-token-2" },
      });
    });

    it("setMetadata が例外を投げた場合は例外を投げ URL を返さない", async () => {
      const { bucket, getMetadata, setMetadata } = createFakeBucket();
      getMetadata.mockResolvedValueOnce([{}]);
      setMetadata.mockRejectedValueOnce(new Error("permission denied"));
      const store = createStorageImageStore(bucket, () => "tok-1");

      await expect(
        store.getDownloadUrl("bugReports/u1/r1/a.png"),
      ).rejects.toThrow("permission denied");
    });

    it("generateToken を省略したときの既定が UUID 形式のトークンを生成する", async () => {
      const { bucket, getMetadata } = createFakeBucket();
      getMetadata.mockResolvedValueOnce([{}]);
      const store = createStorageImageStore(bucket);

      const url = await store.getDownloadUrl("bugReports/u1/r1/a.png");
      expect(url).toMatch(
        /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/bucket-1\/o\/bugReports%2Fu1%2Fr1%2Fa\.png\?alt=media&token=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });
});
