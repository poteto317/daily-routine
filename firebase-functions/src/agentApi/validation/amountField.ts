import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

export const MAX_AMOUNT = 1_000_000_000;

/** 金額フィールド（0 より大きく MAX_AMOUNT 以下の有限数）を読み取る。未指定は undefined */
export const readAmount = (
  body: JsonObject,
  field: string,
): number | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (
    typeof raw !== "number" ||
    !Number.isFinite(raw) ||
    raw <= 0 ||
    raw > MAX_AMOUNT
  ) {
    throw invalidField(
      field,
      `0 より大きく ${MAX_AMOUNT} 以下の数値で指定してください`,
    );
  }
  return raw;
};
