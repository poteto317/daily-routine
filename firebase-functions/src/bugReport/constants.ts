/** Firestore の不具合報告コレクション名 */
export const BUG_REPORTS_COLLECTION = "bugReports";

/**
 * processing ロックのタイムアウト（ミリ秒）。
 * onBugReportCreated の関数のタイムアウト（180 秒。Claude・GitHub API の呼び出しを含む）を
 * 超える 5 分を採用。これを超えても処理が完了していなければ stuck と判定し、再トリガで
 * 別実行がロックを再取得して処理を続行できる。
 */
export const PROCESSING_LOCK_TIMEOUT_MS = 5 * 60 * 1000;
