import { ApiError } from "../errors";

export type JsonObject = Record<string, unknown>;

/**
 * value が JSON オブジェクト（配列・null 以外のオブジェクト）なら true。
 * true のとき value を JsonObject に絞り込む。各フィールドは unknown のままなので、
 * 中身は読み取る側で検査する。
 */
export const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** リクエストボディが JSON オブジェクト（配列・null 以外）であることを保証する */
export const asJsonObject = (value: unknown): JsonObject => {
  if (!isJsonObject(value)) {
    throw new ApiError(
      400,
      "invalid_body",
      "リクエストボディは JSON オブジェクトで指定してください",
    );
  }
  return value;
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
