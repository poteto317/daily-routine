import type { BudgetExpenseItem, BudgetExpenseItemKind } from "@/types/routine";
import { createBudgetExpenseItem } from "./budgetExpenseItemFactory";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

/**
 * 支出項目（固定費・変動費）を追加する。名前が空白のみの場合は追加せず同じ配列を返す。
 */
export const addBudgetExpenseItem = (
  items: BudgetExpenseItem[],
  name: string,
  amount: number,
  kind: BudgetExpenseItemKind,
): BudgetExpenseItem[] => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return items;

  return [...items, createBudgetExpenseItem(normalized, amount, kind)];
};

/**
 * 支出項目の名前と金額を同時に変更する。
 */
export const updateBudgetExpenseItem = (
  items: BudgetExpenseItem[],
  itemId: string,
  name: string,
  amount: number,
): BudgetExpenseItem[] =>
  items.map((item) => (item.id === itemId ? { ...item, name, amount } : item));

/**
 * 支出項目の分類（固定費/変動費）を変更する。
 */
export const updateBudgetExpenseItemKind = (
  items: BudgetExpenseItem[],
  itemId: string,
  kind: BudgetExpenseItemKind,
): BudgetExpenseItem[] =>
  items.map((item) => (item.id === itemId ? { ...item, kind } : item));

/**
 * 支出項目を削除する。
 */
export const removeBudgetExpenseItem = (
  items: BudgetExpenseItem[],
  itemId: string,
): BudgetExpenseItem[] => items.filter((item) => item.id !== itemId);
