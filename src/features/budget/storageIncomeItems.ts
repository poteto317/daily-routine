import type { BudgetIncomeItem } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_BUDGET_INCOME_ITEMS = "budget-income-items";

export const getBudgetIncomeItems = (): BudgetIncomeItem[] => {
  return getStorageItem<BudgetIncomeItem[]>(
    STORAGE_KEY_BUDGET_INCOME_ITEMS,
    [],
  );
};

export const saveBudgetIncomeItems = (items: BudgetIncomeItem[]): void => {
  setStorageItem(STORAGE_KEY_BUDGET_INCOME_ITEMS, items);
};
