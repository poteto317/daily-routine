import type { Expense } from "@/types/routine";
import { getMonthlyBudget, getMonthlyExpenses } from "./storage";
import { getDefaultExpenseDate, toMonthKey } from "./utils/date";

export type MonthStateSnapshot = {
  monthKey: string;
  monthBudget: number;
  expenses: Expense[];
  defaultExpenseDate: string;
};

export const getMonthStateSnapshot = (date: Date): MonthStateSnapshot => {
  const monthKey = toMonthKey(date);

  return {
    monthKey,
    monthBudget: getMonthlyBudget(monthKey)?.totalAmount || 0,
    expenses: getMonthlyExpenses(monthKey),
    defaultExpenseDate: getDefaultExpenseDate(date),
  };
};

export const parsePositiveAmount = (value: string): number | null => {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  return amount;
};
