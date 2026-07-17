import type { useBudgetPageFormVisibilityState } from "./useBudgetPageFormVisibilityState";
import type { useBudgetPageInputState } from "./useBudgetPageInputState";

type BudgetPageFormVisibilityState = ReturnType<
  typeof useBudgetPageFormVisibilityState
>;
type BudgetPageInputState = ReturnType<typeof useBudgetPageInputState>;

type CreateBudgetPageFormStateResultArgs = {
  visibilityState: BudgetPageFormVisibilityState;
  inputState: BudgetPageInputState;
  closeExpenseForm: () => void;
  openExpenseForm: () => void;
};

export const createBudgetPageFormStateResult = ({
  visibilityState,
  inputState,
  closeExpenseForm,
  openExpenseForm,
}: CreateBudgetPageFormStateResultArgs) => {
  return {
    ...inputState,
    ...visibilityState,
    closeExpenseForm,
    openExpenseForm,
  };
};
