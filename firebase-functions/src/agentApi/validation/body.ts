import { ApiError } from "../errors";

export type JsonObject = Record<string, unknown>;

/** リクエストボディが JSON オブジェクト（配列・null 以外）であることを保証する */
export const asJsonObject = (value: unknown): JsonObject => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(
      400,
      "invalid_body",
      "リクエストボディは JSON オブジェクトで指定してください",
    );
  }
  return value as JsonObject;
};

/** 許可されていないキーが含まれていれば 400 unknown_field にする */
export const assertKnownKeys = (
  body: JsonObject,
  allowed: readonly string[],
): void => {
  const unknownKeys = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknownKeys.length > 0) {
    throw new ApiError(
      400,
      "unknown_field",
      `未対応のフィールドです: ${unknownKeys.join(", ")}`,
    );
  }
};

/** 本文を JSON オブジェクトとして取り出し、許可されていないキーがあれば 400 にする */
export const parseBody = (
  body: unknown,
  allowedKeys: readonly string[],
): JsonObject => {
  const input = asJsonObject(body);
  assertKnownKeys(input, allowedKeys);
  return input;
};
