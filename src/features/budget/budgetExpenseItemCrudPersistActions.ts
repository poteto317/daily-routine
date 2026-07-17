import type { BudgetExpenseItem, BudgetExpenseItemKind } from "@/types/routine";
import {
  addBudgetExpenseItem,
  removeBudgetExpenseItem,
  updateBudgetExpenseItem,
  updateBudgetExpenseItemKind,
} from "./budgetExpenseItemMutations";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

export type PersistBudgetExpenseItems = (items: BudgetExpenseItem[]) => void;
export type ConfirmDelete = (message: string) => boolean;

export const createBudgetExpenseItemAndPersist = (params: {
  items: BudgetExpenseItem[];
  nameInput: string;
  amount: number;
  kind: BudgetExpenseItemKind;
  persist: PersistBudgetExpenseItems;
}): BudgetExpenseItem[] | null => {
  const { items, nameInput, amount, kind, persist } = params;
  const nextItems = addBudgetExpenseItem(items, nameInput, amount, kind);

  if (nextItems === items) {
    return null;
  }

  persist(nextItems);
  return nextItems;
};

/**
 * 支出項目の名前と金額を同時に変更してpersistする。
 * 2つのフィールドを別々のAndPersist呼び出しに分けると、どちらも変更前のitemsを
 * 参照するため後勝ちで一方の変更が失われる。1回の呼び出しで両方を反映する。
 */
export const updateBudgetExpenseItemAndPersist = (params: {
  items: BudgetExpenseItem[];
  itemId: string;
  name: string;
  amount: number;
  persist: PersistBudgetExpenseItems;
}): BudgetExpenseItem[] | null => {
  const { items, itemId, name, amount, persist } = params;
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;

  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem) return null;
  if (currentItem.name === normalized && currentItem.amount === amount) {
    return null;
  }

  const nextItems = updateBudgetExpenseItem(items, itemId, normalized, amount);
  persist(nextItems);
  return nextItems;
};

export const updateBudgetExpenseItemKindAndPersist = (params: {
  items: BudgetExpenseItem[];
  itemId: string;
  kind: BudgetExpenseItemKind;
  persist: PersistBudgetExpenseItems;
}): BudgetExpenseItem[] | null => {
  const { items, itemId, kind, persist } = params;
  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem || currentItem.kind === kind) {
    return null;
  }

  const nextItems = updateBudgetExpenseItemKind(items, itemId, kind);
  persist(nextItems);
  return nextItems;
};

export const deleteBudgetExpenseItemAndPersist = (params: {
  items: BudgetExpenseItem[];
  item: BudgetExpenseItem;
  message: string;
  persist: PersistBudgetExpenseItems;
  confirmDelete?: ConfirmDelete;
}): BudgetExpenseItem[] | null => {
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

  const nextItems = removeBudgetExpenseItem(items, item.id);
  persist(nextItems);
  return nextItems;
};
