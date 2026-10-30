/**
 * 祝日を表す曜日の値（daysOfWeek 配列内で使用）
 */
export const HOLIDAY_DAY_VALUE = 7;

/**
 * ユーザーデータのコレクション名。
 * 通知用の syncRoutines は FCM トークンを、同期データ（agentApi）は uid をドキュメント ID に使うため、
 * 2 種類のドキュメントが同じコレクションに混在する。
 */
export const USERS_COLLECTION = "users";

/** 通知の重複送信を防ぐための送信履歴コレクション名 */
export const NOTIFICATIONS_SENT_COLLECTION = "notifications_sent";
