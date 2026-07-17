import type { Dispatch, SetStateAction } from "react";

type CreateBudgetPageFormVisibilityStateResultArgs = {
  showExpenseForm: boolean;
  setShowExpenseForm: Dispatch<SetStateAction<boolean>>;
};

export const createBudgetPageFormVisibilityStateResult = ({
  showExpenseForm,
  setShowExpenseForm,
}: CreateBudgetPageFormVisibilityStateResultArgs) => {
  return {
    showExpenseForm,
    setShowExpenseForm,
  };
};
