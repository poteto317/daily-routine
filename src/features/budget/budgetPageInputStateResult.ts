import type { Dispatch, SetStateAction } from "react";

type CreateBudgetPageInputStateResultArgs = {
  budgetInputValue: string;
  expenseAmount: string;
  expenseDescription: string;
  setBudgetInputValue: Dispatch<SetStateAction<string>>;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  setExpenseDescription: Dispatch<SetStateAction<string>>;
};

export const createBudgetPageInputStateResult = ({
  budgetInputValue,
  expenseAmount,
  expenseDescription,
  setBudgetInputValue,
  setExpenseAmount,
  setExpenseDescription,
}: CreateBudgetPageInputStateResultArgs) => {
  return {
    budgetInputValue,
    expenseAmount,
    expenseDescription,
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseDescription,
  };
};
