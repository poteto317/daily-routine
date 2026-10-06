import { ApiError } from "../../errors";

const MAX_LIST_ID_LENGTH = 200;

const invalidQuery = (message: string): ApiError =>
  new ApiError(400, "invalid_query", message);

/** クエリの listId（必須）を検証・トリムする */
export const parseQueryListId = (value: string | undefined): string => {
  if (value === undefined || value.trim() === "") {
    throw invalidQuery(
      "listId は必須です（GET /todo/lists で ID を確認できます）",
    );
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_LIST_ID_LENGTH) {
    throw invalidQuery(
      `listId は ${MAX_LIST_ID_LENGTH} 文字以内で指定してください`,
    );
  }
  return trimmed;
};

/** クエリの completed（未完了/完了フィルタ）を検証・パースする。未指定は undefined */
export const parseQueryCompleted = (
  value: string | undefined,
): boolean | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  throw invalidQuery("completed は true または false で指定してください");
};

