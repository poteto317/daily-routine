import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

/** 許可された文字列のいずれかを読み取る。未指定は undefined */
export const readEnum = <T extends string>(
  body: JsonObject,
  field: string,
  values: readonly T[],
): T | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !values.includes(raw as T)) {
    throw invalidField(
      field,
      `${values.join(" / ")} のいずれかを指定してください`,
    );
  }
  return raw as T;
};
