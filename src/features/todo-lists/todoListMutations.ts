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

/**
 * リストの完了済みアイテムを下へ移動する設定を更新する。
 */
export const updateListMoveCompletedToBottom = (
  lists: TodoList[],
  listId: string,
  moveCompletedToBottom: boolean,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          moveCompletedToBottom,
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/**
 * リストの完了済みアイテムを非表示にする設定を更新する。
 */
export const updateListHideCompleted = (
  lists: TodoList[],
  listId: string,
  hideCompleted: boolean,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? { ...list, hideCompleted, updatedAt: new Date().toISOString() }
      : list,
  );

/**
 * リストのアイテムをカテゴリでグルーピング表示する設定を更新する。
 */
export const updateListGroupByCategory = (
  lists: TodoList[],
  listId: string,
  groupByCategory: boolean,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? { ...list, groupByCategory, updatedAt: new Date().toISOString() }
      : list,
  );
