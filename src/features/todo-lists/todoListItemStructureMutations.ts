import { getItemIndentLevel } from "./todoListItemIndentLevel";
import { getItemBlockEndIndex } from "./todoListItemBlockRange";
import type { TodoList } from "./types";

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
    const blockEndIndex = getItemBlockEndIndex(items, fromIndex);

    if (toIndex >= fromIndex && toIndex < blockEndIndex) {
      return list;
    }

    const movedBlock = items.slice(fromIndex, blockEndIndex);
    const remainingItems = [
      ...items.slice(0, fromIndex),
      ...items.slice(blockEndIndex),
    ];

    // 前方移動の場合、移動先アンカー自身の直後ではなく、移動先アンカーの
    // ブロック全体（アンカー＋子孫）の直後に挿入する。移動先アンカー自身の
    // 直後に挿入してしまうと、移動先アンカーの子孫が移動ブロックとの間に
    // 取り残され、移動してきたブロックへ意図せず吸収されてしまう
    // （移動先アンカーに子孫がいない場合は従来の計算式と一致する）。
    const insertIndex =
      toIndex > fromIndex
        ? getItemBlockEndIndex(items, toIndex) - movedBlock.length
        : toIndex;

    remainingItems.splice(insertIndex, 0, ...movedBlock);

    return {
      ...list,
      items: remainingItems,
      updatedAt: new Date().toISOString(),
    };
  });
