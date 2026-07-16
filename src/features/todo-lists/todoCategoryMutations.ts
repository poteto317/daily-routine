import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { createTodoCategory } from "./todoCategoryFactory";
import { normalizeCategoryName } from "./todoCategoryNameNormalization";

/**
 * カテゴリを追加する。名前が空白のみの場合は追加せず同じ配列を返す。
 */
export const addTodoCategory = (
  categories: TodoCategory[],
  name: string,
  color?: TodoItemBgColorValue,
): TodoCategory[] => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return categories;

  return [...categories, createTodoCategory(normalized, color)];
};

/**
 * カテゴリ名を変更する。
 */
export const renameTodoCategory = (
  categories: TodoCategory[],
  categoryId: string,
  name: string,
): TodoCategory[] =>
  categories.map((category) =>
    category.id === categoryId ? { ...category, name } : category,
  );

/**
 * カテゴリの背景色を変更する。undefined を渡すとデフォルト（アイテム自身の
 * bgColor にフォールバック）に戻す。
 */
export const updateTodoCategoryColor = (
  categories: TodoCategory[],
  categoryId: string,
  color: TodoItemBgColorValue | undefined,
): TodoCategory[] =>
  categories.map((category) =>
    category.id === categoryId ? { ...category, color } : category,
  );

/**
 * カテゴリを削除する。このカテゴリを参照しているTodoアイテムの categoryId は
 * そのまま残す（一括書き換えはしない。表示側で参照先が見つからない場合は
 * 未分類として扱う）。
 */
export const removeTodoCategory = (
  categories: TodoCategory[],
  categoryId: string,
): TodoCategory[] =>
  categories.filter((category) => category.id !== categoryId);
