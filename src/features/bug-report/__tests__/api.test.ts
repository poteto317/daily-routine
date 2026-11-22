import * as firestore from "firebase/firestore";
import * as functions from "firebase/functions";
import * as firebaseLib from "@/lib/firebase";
import { submitBugReport } from "../api";
import { BUG_REPORTS_COLLECTION } from "../constants";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "server-timestamp"),
}));

jest.mock("firebase/functions", () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

const mockCallable = jest.fn();

jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: jest.fn(),
  getAuthInstance: jest.fn(),
  getOrCreateUser: jest.fn(),
}));

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
    (firebaseLib.getAuthInstance as jest.Mock).mockReturnValue({
      app: "firebase-app",
    });
    (functions.getFunctions as jest.Mock).mockReturnValue("functions-instance");
    (functions.httpsCallable as jest.Mock).mockReturnValue(mockCallable);
    mockCallable.mockResolvedValue({ data: { reportId: "server-report" } });
    (firestore.collection as jest.Mock).mockReturnValue("collection-ref");
    (firestore.doc as jest.Mock).mockReturnValue(docRef);
    (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
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

  it("画像をサーバーに送り、サーバーで確定した報告 ID を返す", async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], "shot.png", {
      type: "image/png",
    });

    await expect(
      submitBugReport({ description: "  画像つき報告  " }, [file]),
    ).resolves.toBe("server-report");

    expect(functions.getFunctions).toHaveBeenCalledWith(
      "firebase-app",
      "asia-northeast1",
    );
    expect(functions.httpsCallable).toHaveBeenCalledWith(
      "functions-instance",
      "submitBugReportWithImages",
      { timeout: 180_000 },
    );
    expect(mockCallable).toHaveBeenCalledWith({
      description: "画像つき報告",
      title: "",
      stepsToReproduce: "",
      meta: expect.any(Object),
      images: [{ contentType: "image/png", base64: "iVBORw==" }],
    });
    expect(firestore.setDoc).not.toHaveBeenCalled();
  });

  it("枠が不足した場合はエラーを伝播し、本文だけでは送信しない", async () => {
    const file = new File(["image"], "shot.png", { type: "image/png" });
    const error = { code: "functions/resource-exhausted" };
    mockCallable.mockRejectedValueOnce(error);

    await expect(submitBugReport({ description: "本文" }, [file])).rejects.toBe(
      error,
    );
    expect(firestore.setDoc).not.toHaveBeenCalled();
  });
});
