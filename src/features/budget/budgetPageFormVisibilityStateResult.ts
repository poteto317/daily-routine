import type { Dispatch, SetStateAction } from "react";

type CreateBudgetPageFormVisibilityStateResultArgs = {
  showBudgetInput: boolean;
  showExpenseForm: boolean;
  setShowBudgetInput: Dispatch<SetStateAction<boolean>>;
  setShowExpenseForm: Dispatch<SetStateAction<boolean>>;
};

export const createBudgetPageFormVisibilityStateResult = ({
  showBudgetInput,
  showExpenseForm,
  setShowBudgetInput,
  setShowExpenseForm,
}: CreateBudgetPageFormVisibilityStateResultArgs) => {
  return {
    showBudgetInput,
    showExpenseForm,
    setShowBudgetInput,
    setShowExpenseForm,
  };
};
