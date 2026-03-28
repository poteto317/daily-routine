import type { useBudgetPageFormVisibilityState } from "./useBudgetPageFormVisibilityState";
import type { useBudgetPageInputState } from "./useBudgetPageInputState";

type BudgetPageFormVisibilityState = ReturnType<
  typeof useBudgetPageFormVisibilityState
>;
type BudgetPageInputState = ReturnType<typeof useBudgetPageInputState>;

type CreateBudgetPageFormStateResultArgs = {
  visibilityState: BudgetPageFormVisibilityState;
  inputState: BudgetPageInputState;
  closeBudgetInput: () => void;
  closeExpenseForm: () => void;
  openBudgetInput: () => void;
  openExpenseForm: () => void;
};

export const createBudgetPageFormStateResult = ({
  visibilityState,
  inputState,
  closeBudgetInput,
  closeExpenseForm,
  openBudgetInput,
  openExpenseForm,
}: CreateBudgetPageFormStateResultArgs) => {
  return {
    ...inputState,
    ...visibilityState,
    closeBudgetInput,
    closeExpenseForm,
    openBudgetInput,
    openExpenseForm,
  };
};
