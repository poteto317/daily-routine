import { useState } from "react";
import { createBudgetPageFormVisibilityStateResult } from "./budgetPageFormVisibilityStateResult";

type UseBudgetPageFormVisibilityStateParams = {
  initialShowBudgetInput: boolean;
  initialShowExpenseForm: boolean;
};

export const useBudgetPageFormVisibilityState = ({
  initialShowBudgetInput,
  initialShowExpenseForm,
}: UseBudgetPageFormVisibilityStateParams) => {
  const [showBudgetInput, setShowBudgetInput] = useState(
    initialShowBudgetInput,
  );
  const [showExpenseForm, setShowExpenseForm] = useState(
    initialShowExpenseForm,
  );

  return createBudgetPageFormVisibilityStateResult({
    showBudgetInput,
    showExpenseForm,
    setShowBudgetInput,
    setShowExpenseForm,
  });
};
