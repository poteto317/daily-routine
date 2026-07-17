import { parsePositiveAmount } from "./budgetPageStateHelpers";

export type ExpensePayload = {
  amount: number;
  date: string;
  categoryId?: string;
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
