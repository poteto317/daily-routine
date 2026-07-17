import type { BudgetExpenseItem } from "@/types/routine";

export type BudgetExpenseItemKindGroups = {
  fixedItems: BudgetExpenseItem[];
  variableItems: BudgetExpenseItem[];
};

/** 支出項目をkindで固定費/変動費に分類する。 */
export const groupBudgetExpenseItemsByKind = (
  items: BudgetExpenseItem[],
): BudgetExpenseItemKindGroups => ({
  fixedItems: items.filter((item) => item.kind === "fixed"),
  variableItems: items.filter((item) => item.kind === "variable"),
});
