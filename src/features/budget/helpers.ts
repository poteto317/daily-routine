import type { BudgetCategory, Expense } from "@/types/routine";
import { daysInMonth, toMonthKey } from "./utils/date";
import budgetTexts from "./locales/ja.json";

type BudgetCardTone = "positive" | "over";

// Month Navigation Helpers
export const formatBudgetMonthLabel = (date: Date): string =>
  `${date.getFullYear()}${budgetTexts.monthNavigation.yearSuffix} ${date.getMonth() + 1}${budgetTexts.monthNavigation.monthSuffix}`;

// Expense Form Helpers
export const getBudgetExpenseDateBounds = (
  currentDate: Date,
): { minDate: string; maxDate: string } => {
  const month = toMonthKey(currentDate);

  return {
    minDate: `${month}-01`,
    maxDate: `${month}-${String(daysInMonth(currentDate)).padStart(2, "0")}`,
  };
};

// Summary Cards Helpers
export const getRemainingTone = (remaining: number): BudgetCardTone => {
  return remaining >= 0 ? "positive" : "over";
};

export const getRemainingCardClassName = (tone: BudgetCardTone): string => {
  return tone === "positive"
    ? "rounded-xl p-4 bg-green-50 dark:bg-green-100"
    : "rounded-xl p-4 bg-orange-50 dark:bg-orange-100";
};

export const getRemainingValueClassName = (tone: BudgetCardTone): string => {
  return tone === "positive"
    ? "text-2xl font-bold text-green-600 dark:text-green-800"
    : "text-2xl font-bold text-orange-600 dark:text-orange-800";
};

export const shouldShowOverBudget = (tone: BudgetCardTone): boolean => {
  return tone === "over";
};

// Expense List Helpers
export const sortExpensesByDateDesc = (expenses: Expense[]): Expense[] =>
  expenses
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const buildBudgetCategoryLookup = (
  categories: BudgetCategory[],
): Map<string, BudgetCategory> =>
  new Map(categories.map((category) => [category.id, category]));

export const resolveExpenseCategory = (
  categoryLookup: Map<string, BudgetCategory>,
  expense: Expense,
): BudgetCategory | undefined =>
  expense.categoryId ? categoryLookup.get(expense.categoryId) : undefined;
