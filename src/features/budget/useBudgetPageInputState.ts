import { useState } from "react";
import { createBudgetPageInputStateResult } from "./budgetPageInputStateResult";

type UseBudgetPageInputStateParams = {
  initialBudgetInputValue: string;
  initialExpenseAmount: string;
  initialExpenseCategoryId: string;
};

export const useBudgetPageInputState = ({
  initialBudgetInputValue,
  initialExpenseAmount,
  initialExpenseCategoryId,
}: UseBudgetPageInputStateParams) => {
  const [budgetInputValue, setBudgetInputValue] = useState(
    initialBudgetInputValue,
  );
  const [expenseAmount, setExpenseAmount] = useState(initialExpenseAmount);
  const [expenseCategoryId, setExpenseCategoryId] = useState(
    initialExpenseCategoryId,
  );

  return createBudgetPageInputStateResult({
    budgetInputValue,
    expenseAmount,
    expenseCategoryId,
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseCategoryId,
  });
};
