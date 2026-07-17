import { generateId } from "@/lib/storage/core";
import type { BudgetExpenseItem, BudgetExpenseItemKind } from "@/types/routine";

export const createBudgetExpenseItem = (
  name: string,
  amount: number,
  kind: BudgetExpenseItemKind,
): BudgetExpenseItem => ({
  id: generateId("budget-expense-item"),
  name,
  amount,
  kind,
  createdAt: new Date().toISOString(),
});
