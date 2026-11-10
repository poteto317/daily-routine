import type { BudgetCategory, BudgetData, Expense } from "@/types/routine";

type BudgetMonthlyExportData = {
  budgetData: BudgetData;
  budgetCategories: BudgetCategory[];
};

/** 選択月の保存済み支出と、その支出が参照する現存カテゴリを抽出する。 */
export const buildBudgetMonthlyExport = (
  month: string,
  expenses: Expense[],
  categories: BudgetCategory[],
): BudgetMonthlyExportData => {
  const monthlyExpenses = expenses.filter(
    (expense) => expense.date.slice(0, 7) === month,
  );
  const categoryIds = new Set(
    monthlyExpenses.map((expense) => expense.categoryId),
  );

  return {
    budgetData: { expenses: { [month]: monthlyExpenses } },
    budgetCategories: categories.filter((category) =>
      categoryIds.has(category.id),
    ),
  };
};

export const getBudgetMonthlyExportFileName = (month: string): string =>
  `daily-routine-budget-${month}.json`;
