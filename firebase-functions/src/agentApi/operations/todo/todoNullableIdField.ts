import { readString, type JsonObject } from "../../validation";

const ID_OPTIONS = { maxLength: 200, trim: true } as const;

/** null 許容の ID フィールドを読み取る。null は解除、未指定は undefined */
export const readNullableId = (
  body: JsonObject,
  field: string,
): string | null | undefined =>
  body[field] === null ? null : readString(body, field, ID_OPTIONS);
