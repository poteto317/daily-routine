import { isItemCompleted } from "./todoListItemCompletedPredicate";
import { resolveTodoItemCategory } from "./todoCategoryLookup";
import type { TodoCategory, TodoListItem } from "./types";

/**
 * 2つのアイテムが同一セクション（完了状態・カテゴリが共に一致）かどうかを判定する。
 * 表示は常に完了状態→カテゴリ別にソートされるため、異なるセクションを跨ぐ
 * 並び替えは生配列上で無関係なブロックへの意図しない再親子付けを起こしうる。
 */
export const isSameTodoItemSection = (
  a: TodoListItem,
  b: TodoListItem,
  categoryLookup: Map<string, TodoCategory>,
): boolean =>
  isItemCompleted(a) === isItemCompleted(b) &&
  resolveTodoItemCategory(categoryLookup, a)?.id ===
    resolveTodoItemCategory(categoryLookup, b)?.id;
