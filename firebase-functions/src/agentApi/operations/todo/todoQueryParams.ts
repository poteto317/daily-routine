import { ApiError } from "../../errors";

const MAX_LIST_ID_LENGTH = 200;

/** クエリの listId（必須）を検証・トリムする */
export const parseQueryListId = (value: string | undefined): string => {
  if (value === undefined || value.trim() === "") {
    throw new ApiError(
      400,
      "invalid_query",
      "listId は必須です（GET /todo/lists で ID を確認できます）",
    );
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_LIST_ID_LENGTH) {
    throw new ApiError(
      400,
      "invalid_query",
      `listId は ${MAX_LIST_ID_LENGTH} 文字以内で指定してください`,
    );
  }
  return trimmed;
};
