import { useState } from "react";
import { createBudgetPageInputStateResult } from "./budgetPageInputStateResult";

type UseBudgetPageInputStateParams = {
  initialExpenseAmount: string;
  initialExpenseCategoryId: string;
};

export const useBudgetPageInputState = ({
  initialExpenseAmount,
  initialExpenseCategoryId,
}: UseBudgetPageInputStateParams) => {
  const [expenseAmount, setExpenseAmount] = useState(initialExpenseAmount);
  const [expenseCategoryId, setExpenseCategoryId] = useState(
    initialExpenseCategoryId,
  );

  return createBudgetPageInputStateResult({
    expenseAmount,
    expenseCategoryId,
    setExpenseAmount,
    setExpenseCategoryId,
  });
};
