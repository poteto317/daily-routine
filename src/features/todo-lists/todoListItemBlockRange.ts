import { getItemIndentLevel } from "./todoListItemIndentLevel";
import type { TodoListItem } from "./types";

/**
 * 指定したインデックスのアイテムを親（ブロックの起点）とみなし、
 * それより深いインデントを持つ後続アイテム（子孫）を含むブロックの
 * 終了インデックス（exclusive）を返す。
 */
export const getItemBlockEndIndex = (
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
