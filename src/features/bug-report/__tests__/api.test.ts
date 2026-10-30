import * as firestore from "firebase/firestore";
import * as storage from "firebase/storage";
import * as firebaseLib from "@/lib/firebase";
import { submitBugReport } from "../api";
import { BUG_REPORTS_COLLECTION } from "../constants";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "server-timestamp"),
}));

jest.mock("firebase/storage", () => ({
  ref: jest.fn((_storage, path: string) => ({ fullPath: path })),
  uploadBytes: jest.fn(),
  deleteObject: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: jest.fn(),
  getStorageInstance: jest.fn(),
  getOrCreateUser: jest.fn(),
}));

function makeFile(name: string, type: string, sizeBytes = 256): File {
  const file = new File([new Uint8Array(1)], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

describe("submitBugReport", () => {
  const docRef = { id: "report-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseLib.getOrCreateUser as jest.Mock).mockResolvedValue({
      uid: "user-1",
    });
    (firebaseLib.getFirestoreInstance as jest.Mock).mockReturnValue(
      "firestore-instance",
    );
    (firebaseLib.getStorageInstance as jest.Mock).mockReturnValue(
      "storage-instance",
    );
    (firestore.collection as jest.Mock).mockReturnValue("collection-ref");
    (firestore.doc as jest.Mock).mockReturnValue(docRef);
    (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
    (storage.uploadBytes as jest.Mock).mockResolvedValue({});
    (storage.deleteObject as jest.Mock).mockResolvedValue(undefined);
  });

  it("bugReports コレクションへ採番した docRef に対して setDoc で uid・status:pending を付与して保存する", async () => {
    const id = await submitBugReport({
      title: "タイトル",
      description: "不具合の内容",
      stepsToReproduce: "手順",
    });

    expect(firestore.collection).toHaveBeenCalledWith(
      "firestore-instance",
      BUG_REPORTS_COLLECTION,
    );
    expect(firestore.doc).toHaveBeenCalledWith("collection-ref");
    expect(firestore.setDoc).toHaveBeenCalledTimes(1);
    expect((firestore.setDoc as jest.Mock).mock.calls[0][0]).toBe(docRef);

    const payload = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(payload.uid).toBe("user-1");
    expect(payload.status).toBe("pending");
    expect(payload.title).toBe("タイトル");
    expect(payload.description).toBe("不具合の内容");
    expect(payload.stepsToReproduce).toBe("手順");
    expect(payload.meta).toBeDefined();
    expect(payload.createdAt).toBe("server-timestamp");
    expect(payload.updatedAt).toBe("server-timestamp");
    expect(payload).not.toHaveProperty("images");
    expect(firebaseLib.getStorageInstance).not.toHaveBeenCalled();
    expect(storage.uploadBytes).not.toHaveBeenCalled();

    expect(id).toBe("report-123");
  });

  it("入力値の前後の空白をトリムし、未指定フィールドは空文字にする", async () => {
    await submitBugReport({ description: "  本文  " });

    const payload = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(payload.title).toBe("");
    expect(payload.stepsToReproduce).toBe("");
    expect(payload.description).toBe("本文");
  });

  it("サーバ専用フィールドは書き込まない", async () => {
    await submitBugReport({ description: "本文" });

    const payload = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(payload).not.toHaveProperty("issueNumber");
    expect(payload).not.toHaveProperty("issueUrl");
    expect(payload).not.toHaveProperty("aiLabels");
    expect(payload).not.toHaveProperty("errorMessage");
  });

  it("getOrCreateUser が失敗した場合、エラーが伝播する", async () => {
    (firebaseLib.getOrCreateUser as jest.Mock).mockRejectedValue(
      new Error("auth failed"),
    );
    await expect(submitBugReport({ description: "本文" })).rejects.toThrow(
      "auth failed",
    );
  });

  it("setDoc が失敗した場合、エラーが伝播する", async () => {
    (firestore.setDoc as jest.Mock).mockRejectedValue(
      new Error("firestore write failed"),
    );
    await expect(submitBugReport({ description: "本文" })).rejects.toThrow(
      "firestore write failed",
    );
  });

  it("画像がある場合は先に uploadBytes でアップロードし、その後に setDoc で images を保存する", async () => {
    const file = makeFile("shot.png", "image/png", 500);

    const id = await submitBugReport({ description: "画像つき報告" }, [file]);

    expect(id).toBe("report-123");
    expect(storage.uploadBytes).toHaveBeenCalledTimes(1);
    expect(firestore.setDoc).toHaveBeenCalledTimes(1);
    expect(
      (storage.uploadBytes as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan((firestore.setDoc as jest.Mock).mock.invocationCallOrder[0]);

    const payload = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(payload.images).toHaveLength(1);
    expect(payload.images[0].path).toMatch(
      /^bugReports\/user-1\/report-123\/[A-Za-z0-9_-]{16,64}\.png$/,
    );
    expect(payload.images[0].contentType).toBe("image/png");
    expect(payload.images[0].size).toBe(500);
  });

  it("画像のアップロードが失敗した場合は setDoc を呼ばずエラーを伝播する", async () => {
    (storage.uploadBytes as jest.Mock).mockRejectedValueOnce(
      new Error("storage upload failed"),
    );
    const file = makeFile("shot.png", "image/png");

    await expect(
      submitBugReport({ description: "画像つき報告" }, [file]),
    ).rejects.toThrow("storage upload failed");
    expect(firestore.setDoc).not.toHaveBeenCalled();
  });

  it("setDoc が失敗した場合はアップロード済みの画像を deleteObject で削除し、元のエラーを伝播する", async () => {
    const writeErr = new Error("setDoc failed");
    (firestore.setDoc as jest.Mock).mockRejectedValueOnce(writeErr);
    (storage.deleteObject as jest.Mock).mockRejectedValueOnce(
      new Error("cleanup failed"),
    );
    const file = makeFile("shot.png", "image/png");

    await expect(
      submitBugReport({ description: "画像つき報告" }, [file]),
    ).rejects.toBe(writeErr);

    expect(storage.deleteObject).toHaveBeenCalledTimes(1);
    const deletedRef = (storage.deleteObject as jest.Mock).mock.calls[0][0];
    expect(deletedRef.fullPath).toMatch(
      /^bugReports\/user-1\/report-123\/[A-Za-z0-9_-]{16,64}\.png$/,
    );
  });
});
