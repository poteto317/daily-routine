import * as firestore from "firebase/firestore";
import * as firebaseLib from "@/lib/firebase";
import { submitBugReport } from "../api";
import { BUG_REPORTS_COLLECTION } from "../constants";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(() => "server-timestamp"),
}));

jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: jest.fn(),
  getOrCreateUser: jest.fn(),
}));

describe("submitBugReport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseLib.getOrCreateUser as jest.Mock).mockResolvedValue({
      uid: "user-1",
    });
    (firebaseLib.getFirestoreInstance as jest.Mock).mockReturnValue(
      "firestore-instance",
    );
    (firestore.collection as jest.Mock).mockReturnValue("collection-ref");
    (firestore.addDoc as jest.Mock).mockResolvedValue({ id: "report-123" });
  });

  it("bugReports コレクションへ uid・status:pending を付与して保存する", async () => {
    const id = await submitBugReport({
      title: "タイトル",
      description: "不具合の内容",
      stepsToReproduce: "手順",
    });

    expect(firestore.collection).toHaveBeenCalledWith(
      "firestore-instance",
      BUG_REPORTS_COLLECTION,
    );
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);

    const payload = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(payload.uid).toBe("user-1");
    expect(payload.status).toBe("pending");
    expect(payload.title).toBe("タイトル");
    expect(payload.description).toBe("不具合の内容");
    expect(payload.stepsToReproduce).toBe("手順");
    expect(payload.meta).toBeDefined();
    expect(payload.createdAt).toBe("server-timestamp");
    expect(payload.updatedAt).toBe("server-timestamp");

    expect(id).toBe("report-123");
  });

  it("入力値の前後の空白をトリムし、未指定フィールドは空文字にする", async () => {
    await submitBugReport({ description: "  本文  " });

    const payload = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(payload.title).toBe("");
    expect(payload.stepsToReproduce).toBe("");
    expect(payload.description).toBe("本文");
  });

  it("サーバ専用フィールドは書き込まない", async () => {
    await submitBugReport({ description: "本文" });

    const payload = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(payload).not.toHaveProperty("issueNumber");
    expect(payload).not.toHaveProperty("issueUrl");
    expect(payload).not.toHaveProperty("aiLabels");
    expect(payload).not.toHaveProperty("errorMessage");
  });

  it("getOrCreateUser が失敗した場合、エラーが伝播する", async () => {
    (firebaseLib.getOrCreateUser as jest.Mock).mockRejectedValue(
      new Error("auth failed"),
    );
    await expect(
      submitBugReport({ description: "本文" }),
    ).rejects.toThrow("auth failed");
  });

  it("addDoc が失敗した場合、エラーが伝播する", async () => {
    (firestore.addDoc as jest.Mock).mockRejectedValue(
      new Error("firestore write failed"),
    );
    await expect(
      submitBugReport({ description: "本文" }),
    ).rejects.toThrow("firestore write failed");
  });
});
