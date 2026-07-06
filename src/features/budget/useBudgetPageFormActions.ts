import type { Dispatch, SetStateAction } from "react";
import {
  createBudgetInputCloseHandler,
  createBudgetInputOpenHandler,
  createExpenseFormCloseHandler,
  createExpenseFormOpenHandler,
} from "./budgetPageStateActions";

type UseBudgetPageFormActionsArgs = {
  monthBudget: number;
  setShowBudgetInput: Dispatch<SetStateAction<boolean>>;
  setBudgetInputValue: Dispatch<SetStateAction<string>>;
  setShowExpenseForm: Dispatch<SetStateAction<boolean>>;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  setExpenseCategoryId: Dispatch<SetStateAction<string>>;
};

export const useBudgetPageFormActions = ({
  monthBudget,
  setShowBudgetInput,
  setBudgetInputValue,
  setShowExpenseForm,
  setExpenseAmount,
  setExpenseCategoryId,
}: UseBudgetPageFormActionsArgs) => {
  return {
    closeBudgetInput: createBudgetInputCloseHandler({
      setShowBudgetInput,
      setBudgetInputValue,
    }),
    closeExpenseForm: createExpenseFormCloseHandler({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseCategoryId,
    }),
    openBudgetInput: createBudgetInputOpenHandler({
      monthBudget,
      setBudgetInputValue,
      setShowBudgetInput,
    }),
    openExpenseForm: createExpenseFormOpenHandler({ setShowExpenseForm }),
  };
};
