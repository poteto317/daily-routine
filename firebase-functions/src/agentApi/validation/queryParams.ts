import { ApiError } from "../errors";
import { isValidDate, MONTH_PATTERN } from "./dateFormats";

const invalidQuery = (message: string): ApiError =>
  new ApiError(400, "invalid_query", message);

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
