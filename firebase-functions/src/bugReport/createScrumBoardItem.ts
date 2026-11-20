import {
  SCRUM_BOARD_DESCRIPTION_MAX_LENGTH,
  SCRUM_BOARD_TITLE_MAX_LENGTH,
} from "./constants";

/** 列の取得から作成応答の読み込みまでに使う共通の上限 */
export const SCRUM_BOARD_TIMEOUT_MS = 30_000;

/** Firestore の既存フィールドに保存する起票結果 */
export interface IssueResult {
  issueNumber: number;
  issueUrl: string;
}

interface ScrumBoardDestination {
  origin: string;
  projectId: number;
  credentials: string;
}

interface CreateScrumBoardItemParams extends ScrumBoardDestination {
  content: { title: string; body: string };
}

export const createScrumBoardItem = async ({
  origin,
  projectId,
  credentials,
  content,
}: CreateScrumBoardItemParams): Promise<IssueResult> => {
  const baseUrl = new URL(origin);
  if (baseUrl.protocol !== "https:" || baseUrl.username || baseUrl.password) {
    throw new Error("スクラムかんばんの HTTPS URL を設定してください");
  }
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new Error("スクラムかんばんのプロジェクト ID が不正です");
  }
  if (credentials.indexOf(":") <= 0) {
    throw new Error("スクラムかんばんの認証情報が未設定または不正です");
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(credentials, "utf8").toString("base64")}`,
    "Content-Type": "application/json",
  };
  const signal = AbortSignal.timeout(SCRUM_BOARD_TIMEOUT_MS);
  const requestOptions = { headers, signal, redirect: "error" as const };

  const boardUrl = new URL("/api/board", baseUrl);
  boardUrl.searchParams.set("projectId", String(projectId));
  const boardResponse = await fetch(boardUrl, requestOptions);
  if (!boardResponse.ok) {
    throw new Error(
      `スクラムかんばんの列を取得できません (status=${boardResponse.status})`,
    );
  }

  const board = (await boardResponse.json().catch(() => null)) as {
    columns?: { name: string; id: number }[];
  } | null;
  const todo = Array.isArray(board?.columns)
    ? board.columns.find((column) => column?.name === "Todo")
    : undefined;
  if (!todo || !Number.isSafeInteger(todo.id) || todo.id <= 0) {
    throw new Error("スクラムかんばんに有効な Todo 列がありません");
  }

  const response = await fetch(new URL("/api/items", baseUrl), {
    ...requestOptions,
    method: "POST",
    body: JSON.stringify({
      projectId,
      columnId: todo.id,
      title: Array.from(content.title)
        .slice(0, SCRUM_BOARD_TITLE_MAX_LENGTH)
        .join(""),
      description: Array.from(content.body)
        .slice(0, SCRUM_BOARD_DESCRIPTION_MAX_LENGTH)
        .join(""),
    }),
  });
  if (!response.ok) {
    throw new Error(
      `スクラムかんばんに起票できません (status=${response.status})`,
    );
  }

  const item = (await response.json().catch(() => null)) as {
    number: number;
    projectId: number;
    columnId: number;
  } | null;
  if (
    !item ||
    !Number.isSafeInteger(item.number) ||
    item.number <= 0 ||
    item.projectId !== projectId ||
    item.columnId !== todo.id
  ) {
    throw new Error("スクラムかんばんの起票結果を確認できません");
  }

  const itemUrl = new URL(`/items/${item.number}`, baseUrl);
  itemUrl.searchParams.set("project", String(projectId));
  return { issueNumber: item.number, issueUrl: itemUrl.href };
};
