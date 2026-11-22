/** @jest-environment node */
import { createHash } from "node:crypto";
import { createFakeFirestore } from "../../agentApi/__tests__/fakeFirestore";
import { claimBugReportProcessing } from "../claimBugReportProcessing";
import { PROCESSING_LOCK_TIMEOUT_MS } from "../constants";
import { processBugReport } from "../processBugReport";
import type { ProcessableBugReport } from "../types";

const nowMs = Date.parse("2026-11-22T23:59:59.999Z");
const projectBudget = "bugReportProcessingBudgets/8_2026-11-22";
const userBudget = (uid: string) =>
  `${projectBudget}/users/${createHash("sha256").update(uid).digest("hex")}`;
const reportPath = "bugReports/report";
const report = {
  uid: "first-user",
  status: "pending",
  description: "A sample report",
} satisfies ProcessableBugReport;
const defaults = {
  reportId: "report",
  projectId: 8,
  userLimit: "2",
  projectLimit: "3",
  nowMs,
};

describe("claimBugReportProcessing", () => {
  it("acquires the lock and charges both budgets with the stored owner's UID", async () => {
    const { db, get } = createFakeFirestore({
      [reportPath]: report,
      [projectBudget]: { count: 2 },
      [userBudget(report.uid)]: { count: 1 },
    });

    await expect(claimBugReportProcessing(db, defaults)).resolves.toBe(true);

    expect(get(reportPath)).toMatchObject({ status: "processing" });
    expect(get(reportPath)?.processingAt).toBeDefined();
    expect(get(projectBudget)).toEqual({ count: 3 });
    expect(get(userBudget(report.uid))).toEqual({ count: 2 });
  });

  it.each([
    ["the user limit", 2, 1],
    ["the project limit", 1, 3],
  ])(
    "rejects at %s before invoking image, AI or board dependencies",
    async (_, userCount, projectCount) => {
      const { db, get } = createFakeFirestore({
        [reportPath]: report,
        [projectBudget]: { count: projectCount },
        [userBudget(report.uid)]: { count: userCount },
      });
      const deps = {
        claimProcessing: () => claimBugReportProcessing(db, defaults),
        resolveImages: jest.fn(),
        draftIssue: jest.fn(),
        createIssue: jest.fn(),
        updateReport: jest.fn(),
      };

      await expect(
        processBugReport(report, deps),
      ).resolves.toBe("skipped");

      expect(get(reportPath)).toMatchObject({
        status: "error",
        errorCode: "quota_exceeded",
      });
      expect(get(projectBudget)).toEqual({ count: projectCount });
      expect(get(userBudget(report.uid))).toEqual({ count: userCount });
      expect(deps.resolveImages).not.toHaveBeenCalled();
      expect(deps.draftIssue).not.toHaveBeenCalled();
      expect(deps.createIssue).not.toHaveBeenCalled();
      expect(deps.updateReport).not.toHaveBeenCalled();
      await expect(
        claimBugReportProcessing(db, { ...defaults, nowMs: nowMs + 1 }),
      ).resolves.toBe(false);
      expect(get("bugReportProcessingBudgets/8_2026-11-23")).toBeUndefined();
    },
  );

  it.each([
    { status: "processing", processingAt: { toMillis: () => nowMs - 1 } },
    { status: "error" },
    { status: "issued" },
    { status: "pending", issueNumber: 42 },
  ])(
    "does not charge again for a duplicate or a resolved report",
    async (storedFields) => {
      const { db, get } = createFakeFirestore({
        [reportPath]: { ...report, ...storedFields },
      });

      await expect(claimBugReportProcessing(db, defaults)).resolves.toBe(false);

      expect(get(projectBudget)).toBeUndefined();
      expect(get(userBudget(report.uid))).toBeUndefined();
    },
  );

  it("charges again when reclaiming an expired lock", async () => {
    const { db, get } = createFakeFirestore({
      [reportPath]: {
        ...report,
        status: "processing",
        processingAt: { toMillis: () => nowMs - PROCESSING_LOCK_TIMEOUT_MS },
      },
      [projectBudget]: { count: 1 },
      [userBudget(report.uid)]: { count: 1 },
    });

    await expect(claimBugReportProcessing(db, defaults)).resolves.toBe(true);

    expect(get(projectBudget)).toEqual({ count: 2 });
    expect(get(userBudget(report.uid))).toEqual({ count: 2 });
  });

  it.each([
    [
      "the first millisecond of the next UTC day",
      { nowMs: nowMs + 1 },
      "8_2026-11-23",
    ],
    ["a different project", { projectId: 9 }, "9_2026-11-22"],
  ])("has fresh budgets at %s", async (_, scope, expectedKey) => {
    const { db, get } = createFakeFirestore({
      [reportPath]: report,
      [projectBudget]: { count: 3 },
      [userBudget(report.uid)]: { count: 2 },
    });

    await expect(
      claimBugReportProcessing(db, { ...defaults, ...scope }),
    ).resolves.toBe(true);

    expect(get(`bugReportProcessingBudgets/${expectedKey}`)).toEqual({
      count: 1,
    });
    expect(get(projectBudget)).toEqual({ count: 3 });
  });

  it.each(["userLimit", "projectLimit"] as const)(
    "supports pausing with %s set to zero",
    async (key) => {
      const { db, get } = createFakeFirestore({ [reportPath]: report });

      await expect(
        claimBugReportProcessing(db, { ...defaults, [key]: "0" }),
      ).resolves.toBe(false);

      expect(get(reportPath)).toMatchObject({
        status: "error",
        errorCode: "quota_exceeded",
      });
      expect(get(projectBudget)).toBeUndefined();
      expect(get(userBudget(report.uid))).toBeUndefined();
    },
  );

  it.each(["3extra", "0.5", "-1", "9007199254740992", ""])(
    "rejects invalid limit %j without changing the report",
    async (value) => {
      const { db, get } = createFakeFirestore({ [reportPath]: report });

      await expect(
        claimBugReportProcessing(db, { ...defaults, projectLimit: value }),
      ).rejects.toThrow("BUG_REPORT_PROJECT_DAILY_LIMIT");

      expect(get(reportPath)).toEqual(report);
      expect(get(projectBudget)).toBeUndefined();
    },
  );

  it.each([{}, { count: -1 }, { count: 1.5 }, { count: "1" }])(
    "does not reset corrupt counter %j",
    async (storedCounter) => {
      const { db, get } = createFakeFirestore({
        [reportPath]: report,
        [projectBudget]: storedCounter,
      });

      await expect(claimBugReportProcessing(db, defaults)).rejects.toThrow(
        "Invalid bug report budget counter",
      );

      expect(get(projectBudget)).toEqual(storedCounter);
      expect(get(userBudget(report.uid))).toBeUndefined();
      expect(get(reportPath)).toEqual(report);
    },
  );
});
