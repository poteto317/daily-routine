/** Firestore の不具合報告コレクション名 */
export const BUG_REPORTS_COLLECTION = "bugReports";

/**
 * processing ロックのタイムアウト（ミリ秒）。
 * Cloud Functions の最大実行時間（v2 デフォルト 60s, GitHub API 含めても余裕）を超える
 * 5 分を採用。これを超えても処理が完了していなければ stuck と判定し、再トリガで
 * 別実行がロックを再取得して処理を続行できる。
 */
export const PROCESSING_LOCK_TIMEOUT_MS = 5 * 60 * 1000;
