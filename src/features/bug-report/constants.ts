/** Firestore の不具合報告コレクション名 */
export const BUG_REPORTS_COLLECTION = "bugReports";

/** 入力値の最大文字数 */
export const BUG_REPORT_MAX_TITLE_LENGTH = 100;
export const BUG_REPORT_MAX_DESCRIPTION_LENGTH = 2000;
export const BUG_REPORT_MAX_STEPS_LENGTH = 2000;

/** メタ情報に添付するアプリバージョン（next.config の env から注入） */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown";

/** 添付画像の上限枚数 */
export const MAX_BUG_REPORT_IMAGES = 3;

/** 添付画像 1 枚あたりの最大バイト数（5MB） */
export const MAX_BUG_REPORT_IMAGE_BYTES = 5 * 1024 * 1024;

/** 許可する画像 MIME タイプと保存時の拡張子の対応 */
export const BUG_REPORT_IMAGE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type BugReportImageMimeType = keyof typeof BUG_REPORT_IMAGE_EXTENSIONS;

/** input[type="file"] の accept 属性値 */
export const BUG_REPORT_IMAGE_ACCEPT = Object.keys(
  BUG_REPORT_IMAGE_EXTENSIONS,
).join(",");
