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

export const RESOURCE_OPERATIONS: Record<ResourceName, ResourceOperations> = {
  expenses: expenseOperations,
  categories: categoryOperations,
  incomeItems: incomeItemOperations,
  expenseItems: expenseItemOperations,
  journalEntries: journalOperations,
};
