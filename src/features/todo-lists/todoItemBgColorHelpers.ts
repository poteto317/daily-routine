import type { TodoItemBgColorValue, TodoList } from "./types";

/**
 * アイテムの背景色を更新
 */
export const updateItemBgColorInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
  bgColor: TodoItemBgColorValue,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, bgColor } : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/**
 * リスト内の全アイテムの背景色を一括更新
 */
export const updateAllItemsBgColorInList = (
  lists: TodoList[],
  listId: string,
  bgColor: TodoItemBgColorValue,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) => ({ ...item, bgColor })),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );
