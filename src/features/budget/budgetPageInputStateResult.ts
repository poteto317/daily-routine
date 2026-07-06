import type { Dispatch, SetStateAction } from "react";

type CreateBudgetPageInputStateResultArgs = {
  budgetInputValue: string;
  expenseAmount: string;
  expenseCategoryId: string;
  setBudgetInputValue: Dispatch<SetStateAction<string>>;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  setExpenseCategoryId: Dispatch<SetStateAction<string>>;
};

export const createBudgetPageInputStateResult = ({
  budgetInputValue,
  expenseAmount,
  expenseCategoryId,
  setBudgetInputValue,
  setExpenseAmount,
  setExpenseCategoryId,
}: CreateBudgetPageInputStateResultArgs) => {
  return {
    budgetInputValue,
    expenseAmount,
    expenseCategoryId,
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseCategoryId,
  };
};
