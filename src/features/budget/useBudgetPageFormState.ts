import type { BudgetViewState } from "./budgetViewStateActions";
import { createBudgetPageFormStateResult } from "./budgetPageFormStateResult";
import { useBudgetPageFormActions } from "./useBudgetPageFormActions";
import { useBudgetPageFormVisibilityState } from "./useBudgetPageFormVisibilityState";
import { useBudgetPageInputState } from "./useBudgetPageInputState";

type BudgetFormInitialState = Pick<
  BudgetViewState,
  | "showBudgetInput"
  | "budgetInputValue"
  | "showExpenseForm"
  | "expenseAmount"
  | "expenseCategoryId"
>;

type UseBudgetPageFormStateParams = {
  initialState: BudgetFormInitialState;
  monthBudget: number;
};

export const useBudgetPageFormState = ({
  initialState,
  monthBudget,
}: UseBudgetPageFormStateParams) => {
  const visibilityState = useBudgetPageFormVisibilityState({
    initialShowBudgetInput: initialState.showBudgetInput,
    initialShowExpenseForm: initialState.showExpenseForm,
  });
  const inputState = useBudgetPageInputState({
    initialBudgetInputValue: initialState.budgetInputValue,
    initialExpenseAmount: initialState.expenseAmount,
    initialExpenseCategoryId: initialState.expenseCategoryId,
  });
  const {
    closeBudgetInput,
    closeExpenseForm,
    openBudgetInput,
    openExpenseForm,
  } = useBudgetPageFormActions({
    monthBudget,
    setShowBudgetInput: visibilityState.setShowBudgetInput,
    setBudgetInputValue: inputState.setBudgetInputValue,
    setShowExpenseForm: visibilityState.setShowExpenseForm,
    setExpenseAmount: inputState.setExpenseAmount,
    setExpenseCategoryId: inputState.setExpenseCategoryId,
  });

  return createBudgetPageFormStateResult({
    visibilityState,
    inputState,
    closeBudgetInput,
    closeExpenseForm,
    openBudgetInput,
    openExpenseForm,
  });
};
