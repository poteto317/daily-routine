import { isSameTodoItemSection } from "./todoListItemSection";
import { getBlockAnchorIndices } from "./todoListItemBlocks";
import type { TodoCategory, TodoListItem } from "./types";

/**
 * 親アイテムとその子孫は1つのブロックとして扱われ、表示上のセクション
 * （完了状態・カテゴリ）はブロック先頭（アンカー）の値で決まる
 * （子孫自身の値は使われず親に追従する。groupItemsByCategoryWithCompletedAtEnd
 * 参照）。そのため並び替えの起点・着地点はブロックのアンカーでなければならない。
 * 子孫アイテムを起点・着地点として許可すると、生配列上ではその子孫がブロックの
 * 先頭であるかのように扱われてしまい、意図しない親子関係の破壊
 * （本来の親からの切り離し・無関係なブロックへの吸収）を起こしうる。
 */
export const reorderTodoItemsIfSameSection = (params: {
  items: TodoListItem[];
  categoryLookup: Map<string, TodoCategory>;
  listId: string;
  fromIndex: number;
  toIndex: number;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
}): void => {
  const { items, categoryLookup, listId, fromIndex, toIndex, onReorderItems } =
    params;

  // reorderItemsInList（永続化側）も同様の範囲チェックを持つが、この関数は
  // 実際に永続化されるより前に items[fromIndex]/items[toIndex] を自ら参照する
  // ため、独立して安全な参照を保証する必要がある。
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return;
  }

  // 「アイテムがブロックのアンカーかどうか」の判定はtodoListItemBlocks.ts
  // 側に一本化してあり、表示側（SortableTodoListItem.tsxのドラッグハンドル
  // 表示可否）もここを参照する。判定ロジックを複数箇所で独立に持たないことで、
  // 両者が乖離することを防ぐ。
  const anchorIndices = getBlockAnchorIndices(items);
  if (!anchorIndices.has(fromIndex) || !anchorIndices.has(toIndex)) {
    return;
  }

  if (!isSameTodoItemSection(items[fromIndex], items[toIndex], categoryLookup)) {
    return;
  }

  onReorderItems(listId, fromIndex, toIndex);
};
