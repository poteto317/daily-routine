import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

export const MAX_AMOUNT = 1_000_000_000;

/** 金額フィールドを読み取る。未指定は undefined。下限（0 を含めるか）だけが呼び出しごとに違う */
const readAmountWithin = (
  body: JsonObject,
  field: string,
  allowZero: boolean,
): number | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (
    typeof raw !== "number" ||
    !Number.isFinite(raw) ||
    raw < 0 ||
    (raw === 0 && !allowZero) ||
    raw > MAX_AMOUNT
  ) {
    const lower = allowZero ? "0 以上" : "0 より大きく";
    throw invalidField(
      field,
      `${lower} ${MAX_AMOUNT} 以下の数値で指定してください`,
    );
  }
  return raw;
};

/** 金額フィールド（0 より大きく MAX_AMOUNT 以下の有限数）を読み取る。未指定は undefined */
export const readAmount = (
  body: JsonObject,
  field: string,
): number | undefined => readAmountWithin(body, field, false);

/** 金額フィールド（0 以上 MAX_AMOUNT 以下の有限数）を読み取る。未指定は undefined */
export const readAmountAllowingZero = (
  body: JsonObject,
  field: string,
): number | undefined => readAmountWithin(body, field, true);
