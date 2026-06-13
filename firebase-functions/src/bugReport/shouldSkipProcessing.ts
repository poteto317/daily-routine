import type { ProcessableBugReport } from "./types";

/**
 * 冪等性ガード: 終端状態（Issue 化完了・エラー記録済）はスキップする。
 *
 * 設計方針:
 * - issueNumber が付与済み → 二重作成防止のためスキップ。
 * - status が "issued" / "error" → 終端状態のためスキップ。
 * - status が "processing" は **スキップしない**。
 *   並行実行と stuck 復旧の判定は claimProcessing（トランザクション）に委譲する。
 *   - 別実行が進行中（fresh processingAt）→ claimProcessing が false を返しスキップ。
 *   - 過去にクラッシュ等で stuck（stale processingAt）→ claimProcessing がロックを再取得し処理続行。
 * - status が "pending" → 通常フローで claimProcessing → Issue 作成へ進む。
 */
export const shouldSkipProcessing = (report: ProcessableBugReport): boolean => {
  if (report.issueNumber != null) return true;
  if (report.status === "issued" || report.status === "error") return true;
  return false;
};
