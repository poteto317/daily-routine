import { BudgetData } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_BUDGET = "budget-data";
const DEFAULT_BUDGET_DATA: BudgetData = { budgets: {}, expenses: {} };

export const getBudgetData = (): BudgetData => {
  return getStorageItem<BudgetData>(STORAGE_KEY_BUDGET, DEFAULT_BUDGET_DATA);
};

export const saveBudgetData = (data: BudgetData): void => {
  setStorageItem(STORAGE_KEY_BUDGET, data);
};
