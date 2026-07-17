import type { BudgetIncomeItem } from "@/types/routine";
import {
  addBudgetIncomeItem,
  removeBudgetIncomeItem,
  renameBudgetIncomeItem,
  updateBudgetIncomeItemAmount,
} from "./budgetIncomeItemMutations";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

export type PersistBudgetIncomeItems = (items: BudgetIncomeItem[]) => void;
export type ConfirmDelete = (message: string) => boolean;

export const createBudgetIncomeItemAndPersist = (params: {
  items: BudgetIncomeItem[];
  nameInput: string;
  amount: number;
  persist: PersistBudgetIncomeItems;
}): BudgetIncomeItem[] | null => {
  const { items, nameInput, amount, persist } = params;
  const nextItems = addBudgetIncomeItem(items, nameInput, amount);

  if (nextItems === items) {
    return null;
  }

  persist(nextItems);
  return nextItems;
};

export const renameBudgetIncomeItemAndPersist = (params: {
  items: BudgetIncomeItem[];
  itemId: string;
  name: string;
  persist: PersistBudgetIncomeItems;
}): BudgetIncomeItem[] | null => {
  const { items, itemId, name, persist } = params;
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;

  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem || currentItem.name === normalized) {
    return null;
  }

  const nextItems = renameBudgetIncomeItem(items, itemId, normalized);
  persist(nextItems);
  return nextItems;
};

export const updateBudgetIncomeItemAmountAndPersist = (params: {
  items: BudgetIncomeItem[];
  itemId: string;
  amount: number;
  persist: PersistBudgetIncomeItems;
}): BudgetIncomeItem[] | null => {
  const { items, itemId, amount, persist } = params;
  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem || currentItem.amount === amount) {
    return null;
  }

  const nextItems = updateBudgetIncomeItemAmount(items, itemId, amount);
  persist(nextItems);
  return nextItems;
};

export const deleteBudgetIncomeItemAndPersist = (params: {
  items: BudgetIncomeItem[];
  item: BudgetIncomeItem;
  message: string;
  persist: PersistBudgetIncomeItems;
  confirmDelete?: ConfirmDelete;
}): BudgetIncomeItem[] | null => {
  const {
    items,
    item,
    message,
    persist,
    confirmDelete = window.confirm,
  } = params;

  if (!confirmDelete(message)) {
    return null;
  }

  const nextItems = removeBudgetIncomeItem(items, item.id);
  persist(nextItems);
  return nextItems;
};
