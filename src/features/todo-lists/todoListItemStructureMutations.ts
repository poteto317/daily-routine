import { getItemIndentLevel } from "./todoListItemIndentLevel";
import type { TodoList, TodoListItem } from "./types";

/**
 * 親アイテムとその子（インデントが親より深いアイテム）をブロックとして扱い、
 * `startIndex` から連続する子アイテムの末尾インデックス（exclusive）を返す。
 */
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
 * アイテムをインデント（最大3段階）する。
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
 * アイテムをアウトデント（最小0）する。
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

/**
 * アイテムを別のインデックスへ移動（並び替え）する。
 * 親アイテムとその子をブロックとして一緒に移動する。
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
