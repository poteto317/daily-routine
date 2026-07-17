import { generateId } from "@/lib/storage/core";
import type { BudgetIncomeItem } from "@/types/routine";

export const createBudgetIncomeItem = (
  name: string,
  amount: number,
): BudgetIncomeItem => ({
  id: generateId("budget-income-item"),
  name,
  amount,
  createdAt: new Date().toISOString(),
});
