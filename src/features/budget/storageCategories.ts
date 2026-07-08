import type { BudgetCategory } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_BUDGET_CATEGORIES = "budget-categories";

export const getBudgetCategories = (): BudgetCategory[] => {
  return getStorageItem<BudgetCategory[]>(STORAGE_KEY_BUDGET_CATEGORIES, []);
};

export const saveBudgetCategories = (categories: BudgetCategory[]): void => {
  setStorageItem(STORAGE_KEY_BUDGET_CATEGORIES, categories);
};
