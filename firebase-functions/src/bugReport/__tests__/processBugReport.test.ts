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
  it("pending 報告を claimProcessing → createIssue → issued の順に処理する", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest.fn().mockResolvedValue({
      issueNumber: 7,
      issueUrl: "https://example.com/issues/7",
    });
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      claimProcessing,
      createIssue,
      updateReport,
      now: () => "server-timestamp",
    });

    expect(result).toBe("issued");
    expect(claimProcessing).toHaveBeenCalledTimes(1);
    expect(createIssue).toHaveBeenCalledTimes(1);
    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toEqual({
      status: "issued",
      issueNumber: 7,
      issueUrl: "https://example.com/issues/7",
      updatedAt: "server-timestamp",
    });
  });

  it("status が pending でない場合はスキップする（冪等性）", async () => {
    const claimProcessing = jest.fn();
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(
      { ...pendingReport, status: "issued" },
      { claimProcessing, createIssue, updateReport },
    );

    expect(result).toBe("skipped");
    expect(claimProcessing).not.toHaveBeenCalled();
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("既に issueNumber がある場合はスキップする（二重作成防止）", async () => {
    const claimProcessing = jest.fn();
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(
      { ...pendingReport, issueNumber: 1 },
      { claimProcessing, createIssue, updateReport },
    );

    expect(result).toBe("skipped");
    expect(claimProcessing).not.toHaveBeenCalled();
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("claimProcessing が false を返した場合はスキップする", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(false);
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(pendingReport, {
      claimProcessing,
      createIssue,
      updateReport,
    });

    expect(result).toBe("skipped");
    expect(claimProcessing).toHaveBeenCalledTimes(1);
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("claimProcessing が例外を throw した場合は createIssue を呼ばずに例外が伝播する", async () => {
    const claimProcessing = jest.fn().mockRejectedValue(new Error("Firestore down"));
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    await expect(
      processBugReport(pendingReport, { claimProcessing, createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");
    // status は "pending" のままなのでリトライ時に再処理される
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("Issue 作成に失敗した場合は error を書き戻す", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest
      .fn()
      .mockRejectedValue(new Error("GitHub API への Issue 作成に失敗しました"));
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      claimProcessing,
      createIssue,
      updateReport,
    });

    expect(result).toBe("error");
    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toEqual({
      status: "error",
      errorMessage: "GitHub API への Issue 作成に失敗しました",
    });
  });

  it("now 未指定なら issued / error に updatedAt を付与しない", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 1, issueUrl: "u" });
    const updateReport = jest.fn().mockResolvedValue(undefined);

    await processBugReport(pendingReport, { claimProcessing, createIssue, updateReport });

    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toEqual({
      status: "issued",
      issueNumber: 1,
      issueUrl: "u",
    });
  });

  it("status が processing の場合はスキップする", async () => {
    const claimProcessing = jest.fn();
    const createIssue = jest.fn();
    const updateReport = jest.fn();

    const result = await processBugReport(
      { ...pendingReport, status: "processing" },
      { claimProcessing, createIssue, updateReport },
    );

    expect(result).toBe("skipped");
    expect(claimProcessing).not.toHaveBeenCalled();
    expect(createIssue).not.toHaveBeenCalled();
    expect(updateReport).not.toHaveBeenCalled();
  });

  it("Error 以外の例外が投げられた場合は String() でエラーメッセージを書き戻す", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest.fn().mockRejectedValue("string error");
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      claimProcessing,
      createIssue,
      updateReport,
    });

    expect(result).toBe("error");
    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toEqual({
      status: "error",
      errorMessage: "string error",
    });
  });

  it("失敗時も now が指定されていれば error に updatedAt を付与する", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest.fn().mockRejectedValue(new Error("失敗"));
    const updateReport = jest.fn().mockResolvedValue(undefined);

    await processBugReport(pendingReport, {
      claimProcessing,
      createIssue,
      updateReport,
      now: () => "server-timestamp",
    });

    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toEqual({
      status: "error",
      errorMessage: "失敗",
      updatedAt: "server-timestamp",
    });
  });

  it("createIssue 成功後に issued 書き戻しが失敗した場合、例外が伝播する", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 1, issueUrl: "u" });
    // issued: 失敗、error 書き戻し: 失敗
    const updateReport = jest.fn().mockRejectedValue(new Error("Firestore down"));

    await expect(
      processBugReport(pendingReport, { claimProcessing, createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");
    // issued(失敗) + error 書き戻し(失敗)
    expect(updateReport).toHaveBeenCalledTimes(2);
  });

  it("成功パスの updateReport 失敗後、エラー書き戻しに issueNumber/issueUrl が含まれる", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 1, issueUrl: "u" });
    const updateReport = jest.fn().mockRejectedValue(new Error("Firestore down"));

    await expect(
      processBugReport(pendingReport, { claimProcessing, createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");

    // 2 回目: issued 書き戻し失敗後のエラー書き戻しに issueNumber/issueUrl を含む
    expect(updateReport.mock.calls[1][0]).toEqual({
      status: "error",
      issueNumber: 1,
      issueUrl: "u",
      errorMessage: "Firestore down",
    });
  });

  it("成功後の issued 書き戻し失敗時、エラー書き戻しが成功すれば例外が伝播する", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest
      .fn()
      .mockResolvedValue({ issueNumber: 5, issueUrl: "https://example.com/5" });
    let callCount = 0;
    const updateReport = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error("issued write failed"); // issued: 失敗
      // 2 回目（エラー書き戻し）は成功
    });

    await expect(
      processBugReport(pendingReport, { claimProcessing, createIssue, updateReport }),
    ).rejects.toThrow("issued write failed");

    expect(updateReport).toHaveBeenCalledTimes(2);
    expect(updateReport.mock.calls[1][0]).toEqual({
      status: "error",
      issueNumber: 5,
      issueUrl: "https://example.com/5",
      errorMessage: "issued write failed",
    });
  });

  it("createIssue 失敗後にエラー書き戻しの updateReport も失敗した場合、例外が伝播する", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest.fn().mockRejectedValue(new Error("GitHub失敗"));
    const updateReport = jest.fn().mockRejectedValue(new Error("Firestore down"));

    await expect(
      processBugReport(pendingReport, { claimProcessing, createIssue, updateReport }),
    ).rejects.toThrow("Firestore down");
    // error 書き戻し(失敗)
    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toMatchObject({
      status: "error",
      errorMessage: "GitHub失敗",
    });
  });

  it("undefined が throw された場合は errorMessage が 'undefined' になる", async () => {
    const claimProcessing = jest.fn().mockResolvedValue(true);
    const createIssue = jest.fn().mockRejectedValue(undefined);
    const updateReport = jest.fn().mockResolvedValue(undefined);

    const result = await processBugReport(pendingReport, {
      claimProcessing,
      createIssue,
      updateReport,
    });

    expect(result).toBe("error");
    expect(updateReport).toHaveBeenCalledTimes(1);
    expect(updateReport.mock.calls[0][0]).toMatchObject({ errorMessage: "undefined" });
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

  it("status が error なら true を返す", () => {
    expect(shouldSkipProcessing({ uid: "u", description: "d", status: "error" })).toBe(true);
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
