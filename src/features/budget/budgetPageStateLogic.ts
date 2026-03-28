import { parsePositiveAmount } from "./budgetPageStateHelpers";

export type BudgetSavePayload = {
  monthKey: string;
  amount: number;
};

export type ExpensePayload = {
  amount: number;
  date: string;
  description?: string;
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
  expenseDescription: string;
}): ExpensePayload | null => {
  const { expenseAmount, expenseDate, expenseDescription } = params;
  const amount = parsePositiveAmount(expenseAmount);

  if (amount === null || !expenseDate) {
    return null;
  }

  return {
    amount,
    date: expenseDate,
    description: expenseDescription || undefined,
  };
};

export const getBudgetInputInitialValue = (monthBudget: number): string => {
  return monthBudget > 0 ? String(monthBudget) : "";
};
