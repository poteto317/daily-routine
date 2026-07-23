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

/**
 * 各ブロックの先頭（アンカー）に対応する生配列インデックスの集合を返す。
 * アンカーであるインデックスのみが、並び替えの起点・着地点として安全に
 * 扱える（アンカー以外＝子孫を起点・着地点にすると意図しない親子関係の
 * 破壊を起こしうる）。「アイテムがブロックのアンカーかどうか」を判定する
 * 唯一の場所とし、他の場所（表示上のドラッグハンドル表示可否など）でも
 * ここを参照することで判定の重複・乖離を避ける。
 */
export const getBlockAnchorIndices = (items: TodoListItem[]): Set<number> => {
  const anchorIndices = new Set<number>();
  let cursor = 0;

  for (const block of splitIntoItemBlocks(items)) {
    anchorIndices.add(cursor);
    cursor += block.length;
  }

  return anchorIndices;
};
