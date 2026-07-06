import { generateId } from "@/lib/storage/core";
import type { Expense } from "@/types/routine";
import { getBudgetData, saveBudgetData } from "./storageData";

export const getMonthlyExpenses = (month: string): Expense[] => {
  const data = getBudgetData();
  return data.expenses[month] || [];
};

export const addExpense = (
  date: string,
  amount: number,
  categoryId?: string,
): void => {
  const data = getBudgetData();
  const month = date.substring(0, 7);

  if (!data.expenses[month]) {
    data.expenses[month] = [];
  }

  data.expenses[month].push({
    id: generateId("expense"),
    date,
    amount,
    categoryId,
    createdAt: new Date().toISOString(),
  });

  saveBudgetData(data);
};

export const deleteExpense = (month: string, expenseId: string): void => {
  const data = getBudgetData();

  if (!data.expenses[month]) return;

  data.expenses[month] = data.expenses[month].filter(
    (expense) => expense.id !== expenseId,
  );
  saveBudgetData(data);
};

export const getMonthlyTotalExpense = (month: string): number => {
  return getMonthlyExpenses(month).reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
};
