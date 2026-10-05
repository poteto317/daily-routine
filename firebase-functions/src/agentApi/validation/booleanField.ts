import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

/** 真偽値フィールドを読み取る。未指定は undefined */
export const readBoolean = (
  body: JsonObject,
  field: string,
): boolean | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "boolean") {
    throw invalidField(field, "true / false で指定してください");
  }
  return raw;
};
