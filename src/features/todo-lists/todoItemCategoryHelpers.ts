import type { TodoList } from "./types";

/**
 * アイテムに割り当てるカテゴリを更新する。undefined を渡すと未分類にする。
 */
export const updateItemCategoryInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
  categoryId: string | undefined,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, categoryId } : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );
