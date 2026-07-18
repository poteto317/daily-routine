import type { TodoCategory, TodoListItem } from "./types";
import { resolveTodoItemCategory } from "./todoCategoryLookup";

/**
 * カテゴリごとにアイテムをグルーピングする。
 * グループの並び順は「そのグループの最初のアイテムが元の配列で最初に現れた位置」の
 * 昇順（安定ソート）。categoryId が未設定、または参照先カテゴリが削除済みの
 * アイテムは「未分類」グループとして扱い、常に最後に配置する。
 */
export const groupItemsByCategory = (
  items: TodoListItem[],
  categoryLookup: Map<string, TodoCategory>,
): TodoListItem[] => {
  const buckets = new Map<string, TodoListItem[]>();
  const bucketOrder: string[] = [];
  const uncategorized: TodoListItem[] = [];

  for (const item of items) {
    const category = resolveTodoItemCategory(categoryLookup, item);
    if (!category) {
      uncategorized.push(item);
      continue;
    }
    if (!buckets.has(category.id)) {
      buckets.set(category.id, []);
      bucketOrder.push(category.id);
    }
    buckets.get(category.id)?.push(item);
  }

  const orderedBuckets = bucketOrder.map((id) => buckets.get(id) ?? []);

  return [...orderedBuckets.flat(), ...uncategorized];
};
