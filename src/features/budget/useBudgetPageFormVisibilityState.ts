import { useState } from "react";
import { createBudgetPageFormVisibilityStateResult } from "./budgetPageFormVisibilityStateResult";

type UseBudgetPageFormVisibilityStateParams = {
  initialShowExpenseForm: boolean;
};

export const useBudgetPageFormVisibilityState = ({
  initialShowExpenseForm,
}: UseBudgetPageFormVisibilityStateParams) => {
  const [showExpenseForm, setShowExpenseForm] = useState(
    initialShowExpenseForm,
  );

  return createBudgetPageFormVisibilityStateResult({
    showExpenseForm,
    setShowExpenseForm,
  });
};
