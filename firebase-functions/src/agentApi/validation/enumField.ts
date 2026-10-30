import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

/**
 * value が許可された文字列のいずれかなら true。
 * true のとき value の型を T に絞り込むため、呼び出し側で as を書かずに済む。
 */
export const isOneOf = <T extends string>(
  values: readonly T[],
  value: unknown,
): value is T => {
  // readonly T[] は readonly string[] に代入できる（広げる方向なので as は不要）
  const allowed: readonly string[] = values;
  return typeof value === "string" && allowed.includes(value);
};

/** 許可された文字列のいずれかを読み取る。未指定は undefined */
export const readEnum = <T extends string>(
  body: JsonObject,
  field: string,
  values: readonly T[],
): T | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (!isOneOf(values, raw)) {
    throw invalidField(
      field,
      `${values.join(" / ")} のいずれかを指定してください`,
    );
  }
  return raw;
};
