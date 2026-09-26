import type { Expense } from "@/types/routine";

export type ExpenseTotals = {
  todayExpense: number;
  totalExpense: number;
};

/**
 * 支出リストから、支出合計および本日の支出合計を集計する。
 */
export const calculateExpenseTotals = (
  expenses: readonly Expense[],
  todayKey: string,
): ExpenseTotals => {
  let totalExpense = 0;
  let todayExpense = 0;
  for (const expense of expenses) {
    totalExpense += expense.amount;
    if (expense.date === todayKey) {
      todayExpense += expense.amount;
    }
  }
  return { todayExpense, totalExpense };
};
