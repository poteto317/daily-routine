import { getItemBlockEndIndex } from "./todoListItemBlockRange";
import type { TodoListItem } from "./types";

/**
 * フラットな配列を「親＋その子孫（インデントが深い後続アイテム）」の
 * ブロック単位に分割する。各ブロックの先頭アイテムが、そのブロックを
 * 代表するアイテム（並び替え時のカテゴリ・完了状態の判定基準）となる。
 */
export const splitIntoItemBlocks = (
  items: TodoListItem[],
): TodoListItem[][] => {
  const blocks: TodoListItem[][] = [];
  let index = 0;

  while (index < items.length) {
    const endIndex = getItemBlockEndIndex(items, index);
    blocks.push(items.slice(index, endIndex));
    index = endIndex;
  }

  return blocks;
};
