import {
  categoryOperations,
  expenseItemOperations,
  incomeItemOperations,
} from "./budgetCollections";
import { expenseOperations } from "./expenses";
import { journalOperations } from "./journal";
import type { ResourceOperations } from "./types";

export type ResourceName =
  | "expenses"
  | "categories"
  | "incomeItems"
  | "expenseItems"
  | "journalEntries";

/** 一覧で受け付けるクエリパラメータ。一覧以外の操作ではクエリを受け付けない */
export const RESOURCE_QUERY_KEYS: Record<ResourceName, readonly string[]> = {
  expenses: ["month"],
  categories: [],
  incomeItems: [],
  expenseItems: [],
  journalEntries: ["date"],
};

export const RESOURCE_OPERATIONS: Record<ResourceName, ResourceOperations> = {
  expenses: expenseOperations,
  categories: categoryOperations,
  incomeItems: incomeItemOperations,
  expenseItems: expenseItemOperations,
  journalEntries: journalOperations,
};
