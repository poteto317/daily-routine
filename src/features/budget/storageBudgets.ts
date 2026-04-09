import { generateId } from "@/lib/storage/core";
import { type MonthlyBudget } from "@/types/routine";
import { getBudgetData, saveBudgetData } from "./storageData";

export const getMonthlyBudget = (month: string): MonthlyBudget | null => {
  const data = getBudgetData();
  return data.budgets[month] || null;
};

export const setMonthlyBudget = (month: string, amount: number): void => {
  const data = getBudgetData();
  const now = new Date().toISOString();

  if (data.budgets[month]) {
    data.budgets[month].totalAmount = amount;
    data.budgets[month].updatedAt = now;
  } else {
    data.budgets[month] = {
      id: generateId("budget"),
      month,
      totalAmount: amount,
      createdAt: now,
      updatedAt: now,
    };
  }

  saveBudgetData(data);
};
