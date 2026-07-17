import type { BudgetExpenseItem, BudgetExpenseItemKind } from "@/types/routine";
import {
  addBudgetExpenseItem,
  removeBudgetExpenseItem,
  renameBudgetExpenseItem,
  updateBudgetExpenseItemAmount,
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

export const renameBudgetExpenseItemAndPersist = (params: {
  items: BudgetExpenseItem[];
  itemId: string;
  name: string;
  persist: PersistBudgetExpenseItems;
}): BudgetExpenseItem[] | null => {
  const { items, itemId, name, persist } = params;
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;

  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem || currentItem.name === normalized) {
    return null;
  }

  const nextItems = renameBudgetExpenseItem(items, itemId, normalized);
  persist(nextItems);
  return nextItems;
};

export const updateBudgetExpenseItemAmountAndPersist = (params: {
  items: BudgetExpenseItem[];
  itemId: string;
  amount: number;
  persist: PersistBudgetExpenseItems;
}): BudgetExpenseItem[] | null => {
  const { items, itemId, amount, persist } = params;
  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem || currentItem.amount === amount) {
    return null;
  }

  const nextItems = updateBudgetExpenseItemAmount(items, itemId, amount);
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
