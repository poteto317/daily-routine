import { generateId } from "@/lib/storage/core";
import type { BudgetCategory } from "@/types/routine";

export const createBudgetCategory = (name: string): BudgetCategory => ({
  id: generateId("budget-category"),
  name,
  createdAt: new Date().toISOString(),
});
