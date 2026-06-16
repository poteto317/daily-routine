/** Firestore の不具合報告コレクション名 */
export const BUG_REPORTS_COLLECTION = "bugReports";

/** 入力値の最大文字数 */
export const BUG_REPORT_MAX_TITLE_LENGTH = 100;
export const BUG_REPORT_MAX_DESCRIPTION_LENGTH = 2000;
export const BUG_REPORT_MAX_STEPS_LENGTH = 2000;

/** メタ情報に添付するアプリバージョン（next.config の env から注入） */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown";
