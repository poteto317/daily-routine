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

/**
 * リモートに存在しないフィールドは、その機能を知らない古いバージョンの端末が
 * アップロードしたデータである可能性がある。空の既定値で上書きするとローカル
 * データを消してしまうため、欠損時はローカルの値を維持する。
 * （明示的な空配列/空オブジェクトはユーザーが全削除した結果としてそのまま尊重する）
 */
export const normalizeBudgetSyncData = (
  data: Partial<BudgetSyncData>,
): BudgetSyncData => ({
  budgetData: data.budgetData ?? getBudgetData(),
  budgetCategories: data.budgetCategories ?? getBudgetCategories(),
  budgetIncomeItems: data.budgetIncomeItems ?? getBudgetIncomeItems(),
  budgetExpenseItems: data.budgetExpenseItems ?? getBudgetExpenseItems(),
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
