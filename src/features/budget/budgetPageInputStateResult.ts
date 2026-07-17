import type { Dispatch, SetStateAction } from "react";

type CreateBudgetPageInputStateResultArgs = {
  expenseAmount: string;
  expenseCategoryId: string;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  setExpenseCategoryId: Dispatch<SetStateAction<string>>;
};

export const createBudgetPageInputStateResult = ({
  expenseAmount,
  expenseCategoryId,
  setExpenseAmount,
  setExpenseCategoryId,
}: CreateBudgetPageInputStateResultArgs) => {
  return {
    expenseAmount,
    expenseCategoryId,
    setExpenseAmount,
    setExpenseCategoryId,
  };
};
