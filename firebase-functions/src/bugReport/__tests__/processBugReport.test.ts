import {
  processBugReport,
  type ProcessableBugReport,
} from "../processBugReport";
import { shouldSkipProcessing } from "../shouldSkipProcessing";

const pendingReport: ProcessableBugReport = {
  uid: "user-1",
  description: "不具合の内容",
  status: "pending",
};

describe("processBugReport", () => {
  it("status が pending の報告は Issue を作成し issued を書き戻す", async () => {
    const createIssue = jest.fn().mockResolvedValue({
      issueNumber: 7,
      issueUrl: "https://example.com/issues/7",
    });
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      createIssue,
      updateReport,
      now: () => "server-timestamp",
    });

    expect(result).toBe("issued");
    expect(createIssue).toHaveBeenCalledTimes(1);
    expect(updateReport).toHaveBeenCalledWith({
      status: "issued",
      issueNumber: 7,
      issueUrl: "https://example.com/issues/7",
      updatedAt: "server-timestamp",
    });
  });

  it("status が pending でない場合はスキップする（冪等性）", async () => {
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(
      { ...pendingReport, status: "issued" },
      { createIssue, updateReport },
    );

    expect(result).toBe("skipped");
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("既に issueNumber がある場合はスキップする（二重作成防止）", async () => {
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(
      { ...pendingReport, issueNumber: 1 },
      { createIssue, updateReport },
    );

    expect(result).toBe("skipped");
    expect(createIssue).not.toHaveBeenCalled();
  });

  it("Issue 作成に失敗した場合は error ステータスを書き戻す", async () => {
    const createIssue = jest
      .fn()
      .mockRejectedValue(new Error("GitHub API への Issue 作成に失敗しました"));
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      createIssue,
      updateReport,
    });

    expect(result).toBe("error");
    expect(updateReport).toHaveBeenCalledWith({
      status: "error",
      errorMessage: "GitHub API への Issue 作成に失敗しました",
    });
  });

  it("now 未指定なら updatedAt は付与しない", async () => {
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 1, issueUrl: "u" });
    const updateReport = jest.fn().mockResolvedValue(undefined);

    await processBugReport(pendingReport, { createIssue, updateReport });

    expect(updateReport).toHaveBeenCalledWith({
      status: "issued",
      issueNumber: 1,
      issueUrl: "u",
    });
  });

  it("status が processing の場合はスキップする", async () => {
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(
      { ...pendingReport, status: "processing" },
      { createIssue, updateReport },
    );

    expect(result).toBe("skipped");
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("Error 以外の例外が投げられた場合は String() でエラーメッセージを書き戻す", async () => {
    const createIssue = jest.fn().mockRejectedValue("string error");
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      createIssue,
      updateReport,
    });

    expect(result).toBe("error");
    expect(updateReport).toHaveBeenCalledWith({
      status: "error",
      errorMessage: "string error",
    });
  });

  it("失敗時も now が指定されていれば updatedAt を付与する", async () => {
    const createIssue = jest.fn().mockRejectedValue(new Error("失敗"));
    const updateReport = jest.fn().mockResolvedValue(undefined);

    await processBugReport(pendingReport, {
      createIssue,
      updateReport,
      now: () => "server-timestamp",
    });

    expect(updateReport).toHaveBeenCalledWith({
      status: "error",
      errorMessage: "失敗",
      updatedAt: "server-timestamp",
    });
  });

  it("createIssue 成功後に updateReport が失敗した場合、例外が伝播する", async () => {
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 1, issueUrl: "u" });
    const updateReport = jest
      .fn()
      .mockRejectedValue(new Error("Firestore down"));

    await expect(
      processBugReport(pendingReport, { createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");
    // 成功の書き戻し失敗 → catch でエラーの書き戻しも試みる
    expect(updateReport).toHaveBeenCalledTimes(2);
  });

  it("成功パスの updateReport 失敗後、エラー書き戻しの内容が正しい", async () => {
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 1, issueUrl: "u" });
    const updateReport = jest
      .fn()
      .mockRejectedValue(new Error("Firestore down"));

    await expect(
      processBugReport(pendingReport, { createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");

    // 2 回目の呼び出しで status: "error" と errorMessage が書き戻されること
    expect(updateReport.mock.calls[1][0]).toEqual({
      status: "error",
      errorMessage: "Firestore down",
    });
  });

  it("createIssue 失敗後にエラー書き戻しの updateReport も失敗した場合、例外が伝播する", async () => {
    const createIssue = jest.fn().mockRejectedValue(new Error("GitHub失敗"));
    const updateReport = jest.fn().mockRejectedValue(new Error("Firestore down"));

    await expect(
      processBugReport(pendingReport, { createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");
    // createIssue 失敗 → catch でエラー書き戻しのみ試みる（計1回）
    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error", errorMessage: "GitHub失敗" }),
    );
  });

  it("undefined が throw された場合は errorMessage が 'undefined' になる", async () => {
    const createIssue = jest.fn().mockRejectedValue(undefined);
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      createIssue,
      updateReport,
    });

    expect(result).toBe("error");
    expect(updateReport).toHaveBeenCalledWith(
      expect.objectContaining({ errorMessage: "undefined" }),
    );
  });
});

describe("shouldSkipProcessing", () => {
  it("status が pending で issueNumber がなければ false を返す", () => {
    expect(shouldSkipProcessing({ uid: "u", description: "d", status: "pending" })).toBe(false);
  });

  it("status が pending でなければ true を返す", () => {
    expect(shouldSkipProcessing({ uid: "u", description: "d", status: "issued" })).toBe(true);
  });

  it("status が processing なら true を返す", () => {
    expect(shouldSkipProcessing({ uid: "u", description: "d", status: "processing" })).toBe(true);
  });

  it("issueNumber が付与されていれば pending でも true を返す", () => {
    expect(
      shouldSkipProcessing({ uid: "u", description: "d", status: "pending", issueNumber: 1 }),
    ).toBe(true);
  });

  it("issueNumber が 0 の場合は true を返す（0 != null は true、GitHub Issue は 1 始まり）", () => {
    expect(
      shouldSkipProcessing({ uid: "u", description: "d", status: "pending", issueNumber: 0 }),
    ).toBe(true);
  });
});
