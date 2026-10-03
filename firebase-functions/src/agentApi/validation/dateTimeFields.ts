import { isValidDate, TIME_PATTERN } from "./dateFormats";
import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

/** "YYYY-MM-DD" の実在する日付を読み取る。未指定は undefined */
export const readDate = (
  body: JsonObject,
  field: string,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !isValidDate(raw)) {
    throw invalidField(
      field,
      "YYYY-MM-DD 形式の実在する日付で指定してください",
    );
  }
  return raw;
};

/** "HH:mm" の時刻を読み取る。未指定は undefined */
export const readTime = (
  body: JsonObject,
  field: string,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !TIME_PATTERN.test(raw)) {
    throw invalidField(field, "HH:mm 形式で指定してください");
  }
  return raw;
};
