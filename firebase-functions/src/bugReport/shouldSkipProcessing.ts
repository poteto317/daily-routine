import type { ProcessableBugReport } from "./types";

/**
 * 冪等性ガード: トリガ再実行・二重作成を防ぐ。
 * - status が "pending" でなければスキップ。
 * - issueNumber が既に付与されていればスキップ（二重作成防止）。
 */
export const shouldSkipProcessing = (report: ProcessableBugReport): boolean =>
  report.status !== "pending" || report.issueNumber != null;
