import type { TodoList } from "./types";

/**
 * リストのタイトルを更新する。
 */
export const updateListTitle = (
  lists: TodoList[],
  listId: string,
  title: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? { ...list, title, updatedAt: new Date().toISOString() }
      : list,
  );

/**
 * リストのアイテム追加位置を更新する。
 */
export const updateListAddItemPosition = (
  lists: TodoList[],
  listId: string,
  position: "last" | "first",
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? { ...list, addItemPosition: position, updatedAt: new Date().toISOString() }
      : list,
  );
