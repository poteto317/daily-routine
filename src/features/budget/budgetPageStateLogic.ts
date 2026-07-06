import { parsePositiveAmount } from "./budgetPageStateHelpers";

export type BudgetSavePayload = {
  monthKey: string;
  amount: number;
};

export type ExpensePayload = {
  amount: number;
  date: string;
  categoryId?: string;
};

export const buildBudgetSavePayload = (
  monthKey: string,
  budgetInputValue: string,
): BudgetSavePayload | null => {
  const amount = parsePositiveAmount(budgetInputValue);

  if (amount === null) {
    return null;
  }

  return { monthKey, amount };
};

export const buildExpensePayload = (params: {
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
}): ExpensePayload | null => {
  const { expenseAmount, expenseDate, expenseCategoryId } = params;
  const amount = parsePositiveAmount(expenseAmount);

  if (amount === null || !expenseDate) {
    return null;
  }

  return {
    amount,
    date: expenseDate,
    categoryId: expenseCategoryId || undefined,
  };
};

export const getBudgetInputInitialValue = (monthBudget: number): string => {
  return monthBudget > 0 ? String(monthBudget) : "";
};
