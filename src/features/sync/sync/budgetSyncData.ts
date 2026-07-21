import {
  getBudgetCategories,
  getBudgetData,
  getBudgetExpenseItems,
  getBudgetIncomeItems,
  saveBudgetCategories,
  saveBudgetData,
  saveBudgetExpenseItems,
  saveBudgetIncomeItems,
} from "@/features/budget/storage";
import type { SyncPayload } from "./types";

export type BudgetSyncData = Pick<
  SyncPayload,
  | "budgetData"
  | "budgetCategories"
  | "budgetIncomeItems"
  | "budgetExpenseItems"
>;

export type BudgetSyncDataSummary = {
  budgetData?: {
    expenses?: Record<string, unknown>;
  };
  budgetCategories: unknown[];
  budgetIncomeItems: unknown[];
  budgetExpenseItems: unknown[];
};

export const collectBudgetSyncData = (): BudgetSyncData => ({
  budgetData: getBudgetData(),
  budgetCategories: getBudgetCategories(),
  budgetIncomeItems: getBudgetIncomeItems(),
  budgetExpenseItems: getBudgetExpenseItems(),
});

export const normalizeBudgetSyncData = (
  data: Partial<BudgetSyncData>,
): BudgetSyncData => ({
  budgetData: data.budgetData ?? { expenses: {} },
  budgetCategories: data.budgetCategories ?? [],
  budgetIncomeItems: data.budgetIncomeItems ?? [],
  budgetExpenseItems: data.budgetExpenseItems ?? [],
});

export const saveBudgetSyncData = (data: BudgetSyncData): void => {
  saveBudgetData(data.budgetData);
  saveBudgetCategories(data.budgetCategories);
  saveBudgetIncomeItems(data.budgetIncomeItems);
  saveBudgetExpenseItems(data.budgetExpenseItems);
};

export const hasBudgetSyncData = (data: BudgetSyncDataSummary): boolean =>
  Object.keys(data.budgetData?.expenses ?? {}).length > 0 ||
  data.budgetCategories.length > 0 ||
  data.budgetIncomeItems.length > 0 ||
  data.budgetExpenseItems.length > 0;
