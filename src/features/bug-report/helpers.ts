import {
  BUG_REPORT_MAX_DESCRIPTION_LENGTH,
  BUG_REPORT_MAX_STEPS_LENGTH,
  BUG_REPORT_MAX_TITLE_LENGTH,
} from "./constants";
import type {
  BugReportInput,
  BugReportMeta,
  BugReportCreatePayload,
} from "./types";

/** バリデーションエラーの種別（locales のキーと対応） */
export type BugReportValidationError =
  | "descriptionRequired"
  | "descriptionTooLong"
  | "titleTooLong"
  | "stepsTooLong";

/**
 * 報告入力のバリデーションを行う。
 * 問題がなければ null、問題があれば最初に見つかったエラー種別を返す。
 */
export const validateBugReportInput = (
  input: BugReportInput,
): BugReportValidationError | null => {
  const description = input.description.trim();
  if (description.length === 0) {
    return "descriptionRequired";
  }
  if (description.length > BUG_REPORT_MAX_DESCRIPTION_LENGTH) {
    return "descriptionTooLong";
  }
  if ((input.title ?? "").trim().length > BUG_REPORT_MAX_TITLE_LENGTH) {
    return "titleTooLong";
  }
  if (
    (input.stepsToReproduce ?? "").trim().length > BUG_REPORT_MAX_STEPS_LENGTH
  ) {
    return "stepsTooLong";
  }
  return null;
};

/**
 * 不具合報告の Firestore 保存ペイロードを構築する純粋関数。
 * タイムスタンプ（createdAt / updatedAt）は呼び出し元（api.ts）が付与する。
 * Firebase に依存せずテスト可能。
 */
export const buildBugReportPayload = (
  input: BugReportInput,
  uid: string,
  meta: BugReportMeta,
): Omit<BugReportCreatePayload, "createdAt" | "updatedAt"> => ({
  uid,
  title: (input.title ?? "").trim(),
  description: input.description.trim(),
  stepsToReproduce: (input.stepsToReproduce ?? "").trim(),
  meta,
  status: "pending",
});
