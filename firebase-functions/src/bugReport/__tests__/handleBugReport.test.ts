/** @jest-environment node */
import { handleBugReport } from "../handleBugReport";
import { processBugReport } from "../processBugReport";
import {
  countReferencedImages,
  resolveReportImages,
  type ImageStore,
} from "../resolveReportImages";

jest.mock("../processBugReport", () => ({
  processBugReport: jest.fn().mockResolvedValue("issued"),
}));

jest.mock("../createGithubIssue", () => ({
  createGithubIssue: jest.fn(),
}));

jest.mock("../resolveReportImages", () => {
  const actual = jest.requireActual("../resolveReportImages");
  return {
    ...actual,
    resolveReportImages: jest.fn().mockResolvedValue({
      images: [],
      skippedCount: 0,
    }),
  };
});

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
  };
};

const makeDeps = () => ({
  repo: "owner/repo",
  token: "fake-token",
  anthropicApiKey: "none",
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  claimProcessing: jest.fn().mockResolvedValue(true),
});

beforeEach(() => {
  jest.clearAllMocks();
  (processBugReport as jest.Mock).mockResolvedValue("issued");
});

describe("handleBugReport", () => {
  it("最新ドキュメントが存在しない場合は processBugReport を呼ばない", async () => {
    const db = makeDb(null);
    await handleBugReport("report-1", db, makeDeps());
    expect(processBugReport).not.toHaveBeenCalled();
  });

  it("Firestore から最新ドキュメントを読み直し、その内容を processBugReport に渡す", async () => {
    const freshData = { uid: "u1", description: "fresh", status: "pending" };
    const db = makeDb(freshData);
    await handleBugReport("report-1", db, makeDeps());
    expect(processBugReport).toHaveBeenCalledWith(
      expect.objectContaining({ description: "fresh", status: "pending" }),
      expect.any(Object),
    );
  });

  it("最新ドキュメントの status が issued の場合、processBugReport は skipped を返す", async () => {
    (processBugReport as jest.Mock).mockResolvedValue("skipped");
    const db = makeDb({
      uid: "u1",
      description: "d",
      status: "issued",
      issueNumber: 7,
    });
    await handleBugReport("report-1", db, makeDeps());
    expect(processBugReport).toHaveBeenCalledWith(
      expect.objectContaining({ status: "issued" }),
      expect.any(Object),
    );
  });

  it("processBugReport が例外を throw した場合は例外が伝播する", async () => {
    (processBugReport as jest.Mock).mockRejectedValue(
      new Error("processing failed"),
    );
    const db = makeDb({ uid: "u1", description: "d", status: "pending" });
    await expect(handleBugReport("report-1", db, makeDeps())).rejects.toThrow(
      "processing failed",
    );
  });

  describe("createImageStore と resolveImages の配線", () => {
    it("createImageStore 未指定のときは processBugReport の deps.resolveImages が undefined になる", async () => {
      const db = makeDb({ uid: "u1", description: "d", status: "pending" });
      await handleBugReport("report-1", db, makeDeps());

      const passedDeps = (processBugReport as jest.Mock).mock.calls[0][1];
      expect(passedDeps.resolveImages).toBeUndefined();
    });

    it("createImageStore を渡すと deps.resolveImages が resolveReportImages を uid・reportId・images・store・logger で呼ぶ", async () => {
      const fakeStore: ImageStore = {
        getSize: jest.fn(),
        download: jest.fn(),
        getDownloadUrl: jest.fn(),
      };
      const createImageStore = jest.fn().mockReturnValue(fakeStore);
      const reportData = {
        uid: "u1",
        description: "d",
        status: "pending",
        images: [{ path: "bugReports/u1/report-1/a.png" }],
      };
      const db = makeDb(reportData);
      const deps = { ...makeDeps(), createImageStore };

      await handleBugReport("report-1", db, deps);

      const passedDeps = (processBugReport as jest.Mock).mock.calls[0][1];
      expect(typeof passedDeps.resolveImages).toBe("function");
      expect(createImageStore).not.toHaveBeenCalled();

      await passedDeps.resolveImages(reportData);
      expect(createImageStore).toHaveBeenCalledTimes(1);
      expect(resolveReportImages).toHaveBeenCalledWith({
        uid: "u1",
        reportId: "report-1",
        images: reportData.images,
        store: fakeStore,
        logger: deps.logger,
      });
    });

    it("createImageStore が例外（既定バケット未設定など）を投げた場合は例外を伝播させず skippedCount に参照枚数を返し warn を出す", async () => {
      const createImageStore = jest.fn(() => {
        throw new Error("Bucket name not specified or invalid");
      });
      const reportData = {
        uid: "u1",
        description: "d",
        status: "pending",
        images: [{ path: "a" }, { path: "b" }],
      };
      const db = makeDb(reportData);
      const deps = { ...makeDeps(), createImageStore };

      await handleBugReport("report-1", db, deps);

      const passedDeps = (processBugReport as jest.Mock).mock.calls[0][1];
      const res = await passedDeps.resolveImages(reportData);
      expect(res).toEqual({
        images: [],
        skippedCount: countReferencedImages(reportData.images),
      });
      expect(deps.logger.warn).toHaveBeenCalledTimes(1);
      expect(deps.logger.warn.mock.calls[0][0]).toContain("report-1");
      expect(deps.logger.warn.mock.calls[0][0]).not.toContain(
        "Bucket name not specified",
      );
    });
  });
});
