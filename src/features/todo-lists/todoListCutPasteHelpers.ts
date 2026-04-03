import type { TodoList, TodoListItem } from "./types";

/**
 * 指定アイテムをリストから切り取る
 */
export const cutItemsFromList = (
  lists: TodoList[],
  listId: string,
  itemIds: ReadonlySet<string>,
): { updatedLists: TodoList[]; cutItems: TodoListItem[] } => {
  const cutItems: TodoListItem[] = [];
  const updatedLists = lists.map((list) => {
    if (list.id !== listId) return list;
    const remainingItems: TodoListItem[] = [];

    for (const item of list.items) {
      if (itemIds.has(item.id)) {
        cutItems.push(item);
      } else {
        remainingItems.push(item);
      }
    }

    if (cutItems.length === 0) return list;

    return {
      ...list,
      items: remainingItems,
      updatedAt: new Date().toISOString(),
    };
  });
  return { updatedLists, cutItems };
};

/**
 * アイテムのインデントを正規化する（最小インデントを0に合わせ、相対差を維持）
 */
export const normalizeItemIndents = (items: TodoListItem[]): TodoListItem[] => {
  if (items.length === 0) return items;
  const minIndent = items.reduce(
    (min, item) => Math.min(min, item.indent ?? 0),
    Infinity,
  );
  if (minIndent === 0) return items;
  return items.map((item) => ({
    ...item,
    indent: (item.indent ?? 0) - minIndent,
  }));
};

/**
 * アイテムをリストに貼り付ける（インデントを正規化）
 */
export const pasteItemsToList = (
  lists: TodoList[],
  listId: string,
  items: TodoListItem[],
): TodoList[] => {
  if (items.length === 0) return lists;
  const normalizedItems = normalizeItemIndents(items);
  return lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: [...list.items, ...normalizedItems],
          updatedAt: new Date().toISOString(),
        }
      : list,
  );
};
