import type { TodoCategory, TodoListItem } from "./types";
import { resolveTodoItemCategory } from "./todoCategoryLookup";

/**
 * カテゴリごとにアイテムをグルーピングする。
 * グループの並び順は「categoryLookupのキー順（＝カテゴリ管理画面での
 * カテゴリ配列の並び順）」。categoryLookupはbuildTodoCategoryLookupが
 * categories配列からJSのMapの挿入順保持特性を使って生成するため、
 * カテゴリ管理画面でカテゴリを並び替えると、ここでのグループ順にも
 * そのまま反映される。categoryId が未設定、または参照先カテゴリが
 * 削除済みのアイテムは「未分類」グループとして扱い、常に最後に配置する。
 */
export const groupItemsByCategory = (
  items: TodoListItem[],
  categoryLookup: Map<string, TodoCategory>,
): TodoListItem[] => {
  const buckets = new Map<string, TodoListItem[]>();
  const uncategorized: TodoListItem[] = [];

  for (const item of items) {
    const category = resolveTodoItemCategory(categoryLookup, item);
    if (!category) {
      uncategorized.push(item);
      continue;
    }
    if (!buckets.has(category.id)) {
      buckets.set(category.id, []);
    }
    buckets.get(category.id)?.push(item);
  }

  const orderedBuckets = Array.from(categoryLookup.keys())
    .map((id) => buckets.get(id))
    .filter((bucket): bucket is TodoListItem[] => bucket !== undefined);

  return [...orderedBuckets.flat(), ...uncategorized];
};
