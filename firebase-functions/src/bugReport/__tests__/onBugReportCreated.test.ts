import { handleBugReportCreated } from "../onBugReportCreated";
import { processBugReport } from "../processBugReport";

jest.mock("../processBugReport", () => ({
  processBugReport: jest.fn().mockResolvedValue("issued"),
}));

jest.mock("../config", () => ({
  githubToken: { value: () => "fake-token" },
  githubRepo: { value: () => "owner/repo" },
}));

jest.mock("../createGithubIssue", () => ({
  createGithubIssue: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: jest.fn().mockReturnValue("server-ts") },
}));

jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const mockUpdate = jest.fn().mockResolvedValue(undefined);

const makeDb = (docData: Record<string, unknown> | null) => {
  const mockDocRef = {
    get: jest.fn().mockResolvedValue({
      exists: docData !== null,
      data: () => docData,
    }),
    update: mockUpdate,
  };
  return {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef),
    }),
  } as unknown as import("firebase-admin").firestore.Firestore;
};

beforeEach(() => {
  jest.clearAllMocks();
  (processBugReport as jest.Mock).mockResolvedValue("issued");
});

describe("handleBugReportCreated", () => {
  it("最新ドキュメントが存在しない場合は processBugReport を呼ばない", async () => {
    const db = makeDb(null);
    await handleBugReportCreated("report-1", db);
    expect(processBugReport).not.toHaveBeenCalled();
  });

  it("Firestore から最新ドキュメントを読み直し、その内容を processBugReport に渡す", async () => {
    const freshData = { uid: "u1", description: "fresh", status: "pending" };
    const db = makeDb(freshData);
    await handleBugReportCreated("report-1", db);
    expect(processBugReport).toHaveBeenCalledWith(
      expect.objectContaining({ description: "fresh", status: "pending" }),
      expect.any(Object),
    );
  });

  it("最新ドキュメントの status が issued の場合、processBugReport は skipped を返す", async () => {
    (processBugReport as jest.Mock).mockResolvedValue("skipped");
    const db = makeDb({ uid: "u1", description: "d", status: "issued", issueNumber: 7 });
    await handleBugReportCreated("report-1", db);
    expect(processBugReport).toHaveBeenCalledWith(
      expect.objectContaining({ status: "issued" }),
      expect.any(Object),
    );
  });

  it("processBugReport が例外を throw した場合は例外が伝播する", async () => {
    (processBugReport as jest.Mock).mockRejectedValue(new Error("processing failed"));
    const db = makeDb({ uid: "u1", description: "d", status: "pending" });
    await expect(handleBugReportCreated("report-1", db)).rejects.toThrow("processing failed");
  });
});
