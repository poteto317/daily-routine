import { invalidField } from "./fieldError";
import type { JsonObject } from "./body";

export type StringOptions = {
  maxLength: number;
  trim?: boolean;
  allowEmpty?: boolean;
};

/** 文字列フィールドを読み取る。未指定は undefined */
export const readString = (
  body: JsonObject,
  field: string,
  options: StringOptions,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw invalidField(field, "文字列で指定してください");
  }
  const value = options.trim ? raw.trim() : raw;
  if (value.length === 0 && !options.allowEmpty) {
    throw invalidField(field, "空にはできません");
  }
  if (value.length > options.maxLength) {
    throw invalidField(
      field,
      `${options.maxLength} 文字以内で指定してください`,
    );
  }
  return value;
};
