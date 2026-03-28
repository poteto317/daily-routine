import { useState } from "react";
import { createBudgetPageInputStateResult } from "./budgetPageInputStateResult";

type UseBudgetPageInputStateParams = {
  initialBudgetInputValue: string;
  initialExpenseAmount: string;
  initialExpenseDescription: string;
};

export const useBudgetPageInputState = ({
  initialBudgetInputValue,
  initialExpenseAmount,
  initialExpenseDescription,
}: UseBudgetPageInputStateParams) => {
  const [budgetInputValue, setBudgetInputValue] = useState(
    initialBudgetInputValue,
  );
  const [expenseAmount, setExpenseAmount] = useState(initialExpenseAmount);
  const [expenseDescription, setExpenseDescription] = useState(
    initialExpenseDescription,
  );

  return createBudgetPageInputStateResult({
    budgetInputValue,
    expenseAmount,
    expenseDescription,
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseDescription,
  });
};
