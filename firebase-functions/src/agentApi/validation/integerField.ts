import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

export type IntegerRange = { min: number; max: number };

/** min 以上 max 以下の整数フィールドを読み取る。未指定は undefined */
export const readInteger = (
  body: JsonObject,
  field: string,
  range: IntegerRange,
): number | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (
    typeof raw !== "number" ||
    !Number.isInteger(raw) ||
    raw < range.min ||
    raw > range.max
  ) {
    throw invalidField(
      field,
      `${range.min} 以上 ${range.max} 以下の整数で指定してください`,
    );
  }
  return raw;
};
