import type { TodoCategory, TodoListItem } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";

export const buildTodoCategoryLookup = (
  categories: TodoCategory[],
): Map<string, TodoCategory> =>
  new Map(categories.map((category) => [category.id, category]));

/**
 * アイテムに割り当てられたカテゴリを解決する。
 * categoryId が未設定、または参照先が削除済みの場合は undefined（未分類）を返す。
 */
export const resolveTodoItemCategory = (
  categoryLookup: Map<string, TodoCategory>,
  item: Pick<TodoListItem, "categoryId">,
): TodoCategory | undefined =>
  item.categoryId ? categoryLookup.get(item.categoryId) : undefined;

/**
 * アイテムの表示に使う背景色を解決する。
 * カテゴリの色 > アイテム自身のbgColor > undefined(デフォルト) の優先順位。
 */
export const resolveTodoItemDisplayBgColor = (
  categoryLookup: Map<string, TodoCategory>,
  item: Pick<TodoListItem, "categoryId" | "bgColor">,
): TodoItemBgColorValue | undefined =>
  resolveTodoItemCategory(categoryLookup, item)?.color ?? item.bgColor;
