import type { BudgetIncomeItem } from "@/types/routine";
import {
  addBudgetIncomeItem,
  removeBudgetIncomeItem,
  updateBudgetIncomeItem,
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

/**
 * 収入項目の名前と金額を同時に変更してpersistする。
 * 2つのフィールドを別々のAndPersist呼び出しに分けると、どちらも変更前のitemsを
 * 参照するため後勝ちで一方の変更が失われる。1回の呼び出しで両方を反映する。
 */
export const updateBudgetIncomeItemAndPersist = (params: {
  items: BudgetIncomeItem[];
  itemId: string;
  name: string;
  amount: number;
  persist: PersistBudgetIncomeItems;
}): BudgetIncomeItem[] | null => {
  const { items, itemId, name, amount, persist } = params;
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;

  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem) return null;
  if (currentItem.name === normalized && currentItem.amount === amount) {
    return null;
  }

  const nextItems = updateBudgetIncomeItem(items, itemId, normalized, amount);
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
