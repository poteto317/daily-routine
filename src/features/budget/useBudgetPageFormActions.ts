import type { Dispatch, SetStateAction } from "react";
import {
  createExpenseFormCloseHandler,
  createExpenseFormOpenHandler,
} from "./budgetPageStateActions";

type UseBudgetPageFormActionsArgs = {
  setShowExpenseForm: Dispatch<SetStateAction<boolean>>;
  setExpenseAmount: Dispatch<SetStateAction<string>>;
  setExpenseCategoryId: Dispatch<SetStateAction<string>>;
};

export const useBudgetPageFormActions = ({
  setShowExpenseForm,
  setExpenseAmount,
  setExpenseCategoryId,
}: UseBudgetPageFormActionsArgs) => {
  return {
    closeExpenseForm: createExpenseFormCloseHandler({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseCategoryId,
    }),
    openExpenseForm: createExpenseFormOpenHandler({ setShowExpenseForm }),
  };
};
