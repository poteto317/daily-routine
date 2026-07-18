import type { TodoCategory, TodoListItem } from "./types";
import { groupItemsByCategory } from "./todoListCategoryGroupSort";
import { isItemCompleted } from "./todoListItemCompletedPredicate";
import { splitIntoItemBlocks } from "./todoListItemBlocks";

/**
 * カテゴリでグルーピングした上で、完了アイテムは各グループ内に留めず
 * リスト全体の末尾へ移動する。末尾の完了アイテムも未完了アイテムと同様に
 * カテゴリ別にグルーピングされる。
 *
 * 親アイテムとその子（インデントが深い後続アイテム）は1つのブロックとして
 * 扱い、ブロックの先頭アイテム（親）の完了状態・カテゴリのみで所属セクション・
 * グループを決定する。子アイテム自身の完了状態は判定に使わず常に親の
 * 直後に追従させることで、親子の隣接関係を崩さない
 * （子だけが完了/未完了セクションへ別々に移動し、無関係な項目の子であるかの
 * ように見えてしまう問題を避ける）。
 */
export const groupItemsByCategoryWithCompletedAtEnd = (
  items: TodoListItem[],
  categoryLookup: Map<string, TodoCategory>,
): TodoListItem[] => {
  const blocks = splitIntoItemBlocks(items);
  const blockByAnchorId = new Map(blocks.map((block) => [block[0].id, block]));

  const incompleteAnchors = blocks
    .filter((block) => !isItemCompleted(block[0]))
    .map((block) => block[0]);
  const completedAnchors = blocks
    .filter((block) => isItemCompleted(block[0]))
    .map((block) => block[0]);

  const expandAnchors = (anchors: TodoListItem[]): TodoListItem[] =>
    anchors.flatMap((anchor) => blockByAnchorId.get(anchor.id) ?? [anchor]);

  return [
    ...expandAnchors(groupItemsByCategory(incompleteAnchors, categoryLookup)),
    ...expandAnchors(groupItemsByCategory(completedAnchors, categoryLookup)),
  ];
};
