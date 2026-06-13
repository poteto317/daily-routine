import { buildIssueContent, type GithubIssueContent } from "./buildIssueContent";
import type { GithubIssueResult } from "./createGithubIssue";
import { shouldSkipProcessing } from "./shouldSkipProcessing";
import type { ProcessableBugReport } from "./types";

export type { ProcessableBugReport };

/** 処理結果 */
export type ProcessBugReportResult = "skipped" | "issued" | "error";

export interface ProcessBugReportDeps {
  /** status を pending → processing へアトミックに更新し、成功なら true を返す */
  claimProcessing: () => Promise<boolean>;
  /** Issue を作成し結果を返す */
  createIssue: (content: GithubIssueContent) => Promise<GithubIssueResult>;
  /** Firestore ドキュメントを更新する */
  updateReport: (fields: Record<string, unknown>) => Promise<void>;
  /** updatedAt 等に使うサーバ時刻（任意・注入） */
  now?: () => unknown;
}

/**
 * 不具合報告から GitHub Issue を作成し、結果を Firestore に書き戻すコアロジック。
 *
 * 実行順序:
 * 1. 冪等性チェック: status が "pending" でない / issueNumber 既存 → スキップ。
 * 2. claimProcessing でトランザクション的に pending → processing へ更新。
 *    false が返った場合（他の実行がロック済み）はスキップ。
 *    例外が投げられた場合は Cloud Functions にリトライを委ねる（status は pending のまま）。
 * 3. createIssue 失敗: status="error" + errorMessage を書き戻して "error" を返す。
 * 4. issued 書き戻し失敗: issueNumber/issueUrl を含む status="error" の書き戻しを試みた上で例外を再 throw。
 *    再実行時に shouldSkipProcessing が機能し二重作成を防ぐ。
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

  // トランザクションで pending → processing へアトミックに更新（二重作成防止ロック）
  // false が返った場合は他の実行がロック済み → スキップ
  const claimed = await deps.claimProcessing();
  if (!claimed) {
    return "skipped";
  }

  // Phase 1: Issue 作成
  let issueResult!: GithubIssueResult;
  try {
    const content = buildIssueContent(report);
    issueResult = await deps.createIssue(content);
  } catch (createError) {
    const errorMessage =
      createError instanceof Error ? createError.message : String(createError);
    await deps.updateReport(withTimestamp({ status: "error", errorMessage }));
    return "error";
  }

  // Phase 2: 成功を Firestore に書き戻す
  // 書き戻し失敗時は issueNumber/issueUrl を含めてエラー状態を記録し再実行に備える
  try {
    await deps.updateReport(
      withTimestamp({
        status: "issued",
        issueNumber: issueResult.issueNumber,
        issueUrl: issueResult.issueUrl,
      }),
    );
    return "issued";
  } catch (updateError) {
    const errorMessage =
      updateError instanceof Error ? updateError.message : String(updateError);
    try {
      await deps.updateReport(
        withTimestamp({
          status: "error",
          issueNumber: issueResult.issueNumber,
          issueUrl: issueResult.issueUrl,
          errorMessage,
        }),
      );
    } catch {
      // ベストエフォート: エラー書き戻しも失敗した場合は無視して伝播させる
    }
    throw updateError;
  }
};
