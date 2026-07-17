import type { BudgetIncomeItem } from "@/types/routine";
import { createBudgetIncomeItem } from "./budgetIncomeItemFactory";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

/**
 * 収入項目を追加する。名前が空白のみの場合は追加せず同じ配列を返す。
 */
export const addBudgetIncomeItem = (
  items: BudgetIncomeItem[],
  name: string,
  amount: number,
): BudgetIncomeItem[] => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return items;

  return [...items, createBudgetIncomeItem(normalized, amount)];
};

/**
 * 収入項目の名前を変更する。
 */
export const renameBudgetIncomeItem = (
  items: BudgetIncomeItem[],
  itemId: string,
  name: string,
): BudgetIncomeItem[] =>
  items.map((item) => (item.id === itemId ? { ...item, name } : item));

/**
 * 収入項目の金額を変更する。
 */
export const updateBudgetIncomeItemAmount = (
  items: BudgetIncomeItem[],
  itemId: string,
  amount: number,
): BudgetIncomeItem[] =>
  items.map((item) => (item.id === itemId ? { ...item, amount } : item));

/**
 * 収入項目を削除する。
 */
export const removeBudgetIncomeItem = (
  items: BudgetIncomeItem[],
  itemId: string,
): BudgetIncomeItem[] => items.filter((item) => item.id !== itemId);
