import {
  buildIssueContent,
  type GithubIssueContent,
  type IssueDraft,
} from "./buildIssueContent";
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
  /**
   * Issue のタイトルと本文を整形する（任意・注入）。
   * 失敗時は null を返す。例外を投げても従来の内容で起票する。
   */
  draftIssue?: (report: ProcessableBugReport) => Promise<IssueDraft | null>;
}

/**
 * 整形結果を取得する。未指定なら null。
 * 例外は null として扱う（保険）。通常の失敗は呼び出し側のラッパーが warn を出して null を返すため、
 * ここに来るのはラッパーが捕まえなかった想定外の例外だけで、ログは出さない。
 */
const resolveDraft = async (
  report: ProcessableBugReport,
  draftIssue: ProcessBugReportDeps["draftIssue"],
): Promise<IssueDraft | null> => {
  if (!draftIssue) return null;
  try {
    return await draftIssue(report);
  } catch {
    return null;
  }
};

/**
 * 不具合報告から GitHub Issue を作成し、結果を Firestore に書き戻すコアロジック。
 *
 * 実行順序:
 * 1. 冪等性チェック（shouldSkipProcessing）: 終端状態（status が "issued" / "error"）
 *    または issueNumber 既存ならスキップ。"pending" および "processing" は処理対象として
 *    通過し、ロック取得の最終判定は claimProcessing に委ねる。
 * 2. claimProcessing でトランザクション的にロックを取得（pending → processing、または
 *    stale な processing の再取得）。
 *    - true: ロック取得成功。処理続行。
 *    - false: 他の実行が fresh な processing 中、または競合状態。スキップ。
 *    - 例外: Cloud Functions にリトライを委ねる。
 * 3. 整形（任意）: draftIssue があれば Issue のタイトルと本文を整形する。
 *    null または例外なら従来の内容で起票する。ロック取得後に呼ぶため、スキップや
 *    ロック取得失敗の実行では呼ばれない。
 * 4. createIssue 失敗: status="error" + errorMessage を書き戻して "error" を返す。
 * 5. issued 書き戻し失敗: issueNumber/issueUrl を含む status="error" の書き戻しを試みた
 *    上で例外を再 throw。再実行時に shouldSkipProcessing が issueNumber 既存で
 *    スキップし二重作成を防ぐ。
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

  // ロック取得（pending または stale な processing の再取得）。
  // false の場合は他の実行が fresh な processing 中のためスキップ。
  const claimed = await deps.claimProcessing();
  if (!claimed) {
    return "skipped";
  }

  const draft = await resolveDraft(report, deps.draftIssue);

  // Phase 1: Issue 作成
  let issueResult!: GithubIssueResult;
  try {
    const content = buildIssueContent(report, draft);
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
