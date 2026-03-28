import { createBudgetSaveHandler } from "./budgetPageStateActions";
import { createBudgetSaveActionResult } from "./budgetSaveActionResult";

type UseBudgetSaveActionParams = {
  currentMonth: string;
  budgetInputValue: string;
  setMonthBudget: (value: number) => void;
  closeBudgetInput: () => void;
};

export const useBudgetSaveAction = ({
  currentMonth,
  budgetInputValue,
  setMonthBudget,
  closeBudgetInput,
}: UseBudgetSaveActionParams) => {
  const handleSaveBudget = createBudgetSaveHandler({
    currentMonth,
    budgetInputValue,
    setMonthBudget,
    closeBudgetInput,
  });

  return createBudgetSaveActionResult({ handleSaveBudget });
};
