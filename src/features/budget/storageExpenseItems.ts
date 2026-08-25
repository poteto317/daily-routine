import type { BudgetExpenseItem } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_BUDGET_EXPENSE_ITEMS = "budget-expense-items";

export const getBudgetExpenseItems = (): BudgetExpenseItem[] => {
  return getStorageItem<BudgetExpenseItem[]>(
    STORAGE_KEY_BUDGET_EXPENSE_ITEMS,
    [],
  );
};

export const saveBudgetExpenseItems = (items: BudgetExpenseItem[]): void => {
  setStorageItem(STORAGE_KEY_BUDGET_EXPENSE_ITEMS, items);
};
