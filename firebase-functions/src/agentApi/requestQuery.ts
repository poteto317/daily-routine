import { ApiError } from "./errors";

/**
 * Express のクエリを文字列の辞書にする。
 * 同じキーの重複（配列）やネスト（オブジェクト）は、黙って無視すると絞り込みが効かず
 * 全件を返してしまうため、400 invalid_query にする。
 */
export const toStringQuery = (
  query: Record<string, unknown>,
): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => {
      if (value === undefined || typeof value === "string") return [key, value];
      throw new ApiError(
        400,
        "invalid_query",
        `${key} は 1 つの文字列で指定してください`,
      );
    }),
  );
