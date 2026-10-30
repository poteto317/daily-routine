import * as bugReport from "../index";

describe("bug-report/index", () => {
  it("必要なモジュールをすべて正しくエクスポートしている", () => {
    expect(typeof bugReport.BugReportPage).toBe("function");
    expect(typeof bugReport.submitBugReport).toBe("function");
    expect(typeof bugReport.collectBugReportMeta).toBe("function");
    expect(typeof bugReport.validateBugReportInput).toBe("function");
    expect(typeof bugReport.buildBugReportPayload).toBe("function");
    expect(typeof bugReport.useBugReportInputState).toBe("function");
    expect(typeof bugReport.selectBugReportImages).toBe("function");
    expect(typeof bugReport.uploadBugReportImages).toBe("function");
    expect(typeof bugReport.deleteBugReportImages).toBe("function");
  });
});
