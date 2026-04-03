import { getItemIndentLevel } from "./todoListItemIndentLevel";
import { isItemCompleted } from "./todoListItemCompletedPredicate";
import type { TodoList, TodoListItem } from "./types";

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createTodoList = (title: string): TodoList => ({
  id: generateId(),
  title,
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createTodoListItem = (title: string): TodoListItem => ({
  id: generateId(),
  title,
  isCompleted: false,
  createdAt: new Date().toISOString(),
});

export const addItemToList = (
  lists: TodoList[],
  listId: string,
  item: TodoListItem,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: [...list.items, item],
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

export const toggleItemInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId
              ? { ...item, isCompleted: !item.isCompleted }
              : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

export const deleteItemFromList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/** * アイテムのタイトルを更新
 */
export const updateItemTitleInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
  title: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, title } : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/**
 * リストのタイトルを更新
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

/** * アイテムをインデント（最大3段階）
 */
export const indentItemInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId
              ? { ...item, indent: Math.min(getItemIndentLevel(item) + 1, 3) }
              : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/**
 * アイテムをアウトデント（最小0）
 */
export const outdentItemInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId
              ? { ...item, indent: Math.max(getItemIndentLevel(item) - 1, 0) }
              : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

const getReorderBlockEndIndex = (
  items: TodoListItem[],
  startIndex: number,
): number => {
  if (startIndex < 0 || startIndex >= items.length) {
    return startIndex;
  }

  const parentIndent = getItemIndentLevel(items[startIndex]);
  let endIndex = startIndex + 1;

  while (
    endIndex < items.length &&
    getItemIndentLevel(items[endIndex]) > parentIndent
  ) {
    endIndex += 1;
  }

  return endIndex;
};

/**
 * アイテムを別のインデックスへ移動（並び替え）
 */
export const reorderItemsInList = (
  lists: TodoList[],
  listId: string,
  fromIndex: number,
  toIndex: number,
): TodoList[] =>
  lists.map((list) => {
    if (list.id !== listId) return list;

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= list.items.length ||
      toIndex >= list.items.length ||
      fromIndex === toIndex
    ) {
      return list;
    }

    const items = [...list.items];
    const blockEndIndex = getReorderBlockEndIndex(items, fromIndex);

    if (toIndex >= fromIndex && toIndex < blockEndIndex) {
      return list;
    }

    const movedBlock = items.slice(fromIndex, blockEndIndex);
    const remainingItems = [
      ...items.slice(0, fromIndex),
      ...items.slice(blockEndIndex),
    ];
    const insertIndex =
      toIndex > fromIndex ? toIndex - movedBlock.length + 1 : toIndex;

    remainingItems.splice(insertIndex, 0, ...movedBlock);

    return {
      ...list,
      items: remainingItems,
      updatedAt: new Date().toISOString(),
    };
  });

export const getListProgress = (
  list: TodoList,
): { completed: number; total: number; percentage: number } => {
  const total = list.items.length;
  const completed = list.items.filter(isItemCompleted).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
};
