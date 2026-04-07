import { getItemIndentLevel } from "./todoListItemIndentLevel";
import type { TodoList, TodoListItem } from "./types";

/**
 * `insertAfterIndex` は「この位置の次に挿入する」対象の既存アイテム位置を表す。
 * 配列インデックスは 0 ベースのため、有効な既存インデックスは `0` 以上 `length - 1` 以下。
 * そのため、末尾の直後に追加したい場合でも指定できるのは最後の要素の index であり、
 * `length` 自体は有効な既存インデックスではないので `index <= length` ではなく `index < length` を使う。
 */
const isValidInsertIndex = (index: number, length: number): boolean =>
  index >= 0 && index < length;

export const addItemToList = (
  lists: TodoList[],
  listId: string,
  item: TodoListItem,
  insertAfterIndex?: number,
): TodoList[] =>
  lists.map((list) => {
    if (list.id !== listId) return list;
    const newItems =
      insertAfterIndex !== undefined &&
      isValidInsertIndex(insertAfterIndex, list.items.length)
        ? [
            ...list.items.slice(0, insertAfterIndex + 1),
            item,
            ...list.items.slice(insertAfterIndex + 1),
          ]
        : [...list.items, item];
    return {
      ...list,
      items: newItems,
      updatedAt: new Date().toISOString(),
    };
  });

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
