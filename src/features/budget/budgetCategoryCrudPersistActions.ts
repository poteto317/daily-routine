import type { BudgetCategory } from "@/types/routine";
import {
  addBudgetCategory,
  removeBudgetCategory,
  renameBudgetCategory,
} from "./budgetCategoryMutations";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

export type PersistBudgetCategories = (categories: BudgetCategory[]) => void;
export type ConfirmDelete = (message: string) => boolean;

export const createBudgetCategoryAndPersist = (params: {
  categories: BudgetCategory[];
  nameInput: string;
  persist: PersistBudgetCategories;
}): BudgetCategory[] | null => {
  const { categories, nameInput, persist } = params;
  const nextCategories = addBudgetCategory(categories, nameInput);

  if (nextCategories === categories) {
    return null;
  }

  persist(nextCategories);
  return nextCategories;
};

export const renameBudgetCategoryAndPersist = (params: {
  categories: BudgetCategory[];
  categoryId: string;
  name: string;
  persist: PersistBudgetCategories;
}): BudgetCategory[] | null => {
  const { categories, categoryId, name, persist } = params;
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;

  const currentCategory = categories.find(
    (category) => category.id === categoryId,
  );
  if (!currentCategory || currentCategory.name === normalized) {
    return null;
  }

  const nextCategories = renameBudgetCategory(
    categories,
    categoryId,
    normalized,
  );
  persist(nextCategories);
  return nextCategories;
};

export const deleteBudgetCategoryAndPersist = (params: {
  categories: BudgetCategory[];
  category: BudgetCategory;
  message: string;
  persist: PersistBudgetCategories;
  confirmDelete?: ConfirmDelete;
}): BudgetCategory[] | null => {
  const {
    categories,
    category,
    message,
    persist,
    confirmDelete = window.confirm,
  } = params;

  if (!confirmDelete(message)) {
    return null;
  }

  const nextCategories = removeBudgetCategory(categories, category.id);
  persist(nextCategories);
  return nextCategories;
};
