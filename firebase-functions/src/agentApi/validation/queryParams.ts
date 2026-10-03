import { ApiError } from "../errors";
import { isValidDate, MONTH_PATTERN } from "./dateFormats";

const invalidQuery = (message: string): ApiError =>
  new ApiError(400, "invalid_query", message);

/**
 * 許可されていないクエリパラメータがあれば 400 invalid_query にする。
 * 打ち間違い（例: ?mont=2026-10）を黙って無視すると、絞り込んだつもりが全件取得になるため。
 * 値が undefined のキーは指定されていないものとして扱う。
 */
export const assertKnownQueryKeys = (
  query: Record<string, string | undefined>,
  allowed: readonly string[],
): void => {
  const unknownKeys = Object.entries(query)
    .filter(([key, value]) => value !== undefined && !allowed.includes(key))
    .map(([key]) => key);
  if (unknownKeys.length > 0) {
    throw invalidQuery(
      `未対応のクエリパラメータです: ${unknownKeys.join(", ")}`,
    );
  }
};

/** クエリの month（YYYY-MM）を検証する。未指定は undefined */
export const parseQueryMonth = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  if (!MONTH_PATTERN.test(value)) {
    throw invalidQuery("month は YYYY-MM 形式で指定してください");
  }
  return value;
};

/** クエリの date（YYYY-MM-DD）を検証する。未指定は undefined */
export const parseQueryDate = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  if (!isValidDate(value)) {
    throw invalidQuery(
      "date は YYYY-MM-DD 形式の実在する日付で指定してください",
    );
  }
  return value;
};
