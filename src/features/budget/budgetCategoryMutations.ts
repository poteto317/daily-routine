import type { BudgetCategory } from "@/types/routine";
import { createBudgetCategory } from "./budgetCategoryFactory";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

/**
 * カテゴリを追加する。名前が空白のみの場合は追加せず同じ配列を返す。
 */
export const addBudgetCategory = (
  categories: BudgetCategory[],
  name: string,
): BudgetCategory[] => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return categories;

  return [...categories, createBudgetCategory(normalized)];
};

/**
 * カテゴリ名を変更する。
 */
export const renameBudgetCategory = (
  categories: BudgetCategory[],
  categoryId: string,
  name: string,
): BudgetCategory[] =>
  categories.map((category) =>
    category.id === categoryId ? { ...category, name } : category,
  );

/**
 * カテゴリを削除する。このカテゴリを参照している支出記録の categoryId は
 * そのまま残す（一括書き換えはしない。表示側で参照先が見つからない場合は
 * 何も表示しない扱いとする）。
 */
export const removeBudgetCategory = (
  categories: BudgetCategory[],
  categoryId: string,
): BudgetCategory[] =>
  categories.filter((category) => category.id !== categoryId);
