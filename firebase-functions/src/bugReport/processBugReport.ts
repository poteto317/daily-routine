import { buildIssueContent, type GithubIssueContent } from "./buildIssueContent";
import type { GithubIssueResult } from "./createGithubIssue";
import { shouldSkipProcessing } from "./shouldSkipProcessing";
import type { ProcessableBugReport } from "./types";

export type { ProcessableBugReport };

/** 処理結果 */
export type ProcessBugReportResult = "skipped" | "issued" | "error";

export interface ProcessBugReportDeps {
  /** Issue を作成し結果を返す */
  createIssue: (content: GithubIssueContent) => Promise<GithubIssueResult>;
  /** Firestore ドキュメントを更新する */
  updateReport: (fields: Record<string, unknown>) => Promise<void>;
  /** updatedAt 等に使うサーバ時刻（任意・注入） */
  now?: () => unknown;
}

/**
 * 不具合報告から GitHub Issue を作成し、結果を Firestore に書き戻すコアロジック。
 * - 冪等性: status が "pending" でない、または issueNumber が既にある場合はスキップ。
 * - 成功: status="issued" と issueNumber/issueUrl を書き戻す。
 * - 失敗: status="error" と errorMessage を書き戻す。
 *   updateReport が例外を投げた場合はその例外が伝播する。
 */
export const processBugReport = async (
  report: ProcessableBugReport,
  deps: ProcessBugReportDeps,
): Promise<ProcessBugReportResult> => {
  if (shouldSkipProcessing(report)) {
    return "skipped";
  }

  const withTimestamp = (fields: Record<string, unknown>) =>
    deps.now ? { ...fields, updatedAt: deps.now() } : fields;

  try {
    const content = buildIssueContent(report);
    const { issueNumber, issueUrl } = await deps.createIssue(content);
    await deps.updateReport(
      withTimestamp({ status: "issued", issueNumber, issueUrl }),
    );
    return "issued";
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    await deps.updateReport(withTimestamp({ status: "error", errorMessage }));
    return "error";
  }
};
