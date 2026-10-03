import { invalidField } from "./fieldError";

/** 必須フィールドが未指定（undefined）なら 400 にする */
export const required = <T>(field: string, value: T | undefined): T => {
  if (value === undefined) {
    throw invalidField(field, "必須です");
  }
  return value;
};

/** undefined の値を持つキーを取り除く（Firestore に undefined を渡さないため） */
export const compact = <T extends Record<string, unknown>>(
  value: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
