import type { BudgetViewState } from "./budgetViewStateActions";
import { createBudgetPageFormStateResult } from "./budgetPageFormStateResult";
import { useBudgetPageFormActions } from "./useBudgetPageFormActions";
import { useBudgetPageFormVisibilityState } from "./useBudgetPageFormVisibilityState";
import { useBudgetPageInputState } from "./useBudgetPageInputState";

type BudgetFormInitialState = Pick<
  BudgetViewState,
  "showExpenseForm" | "expenseAmount" | "expenseCategoryId"
>;

type UseBudgetPageFormStateParams = {
  initialState: BudgetFormInitialState;
};

export const useBudgetPageFormState = ({
  initialState,
}: UseBudgetPageFormStateParams) => {
  const visibilityState = useBudgetPageFormVisibilityState({
    initialShowExpenseForm: initialState.showExpenseForm,
  });
  const inputState = useBudgetPageInputState({
    initialExpenseAmount: initialState.expenseAmount,
    initialExpenseCategoryId: initialState.expenseCategoryId,
  });
  const { closeExpenseForm, openExpenseForm } = useBudgetPageFormActions({
    setShowExpenseForm: visibilityState.setShowExpenseForm,
    setExpenseAmount: inputState.setExpenseAmount,
    setExpenseCategoryId: inputState.setExpenseCategoryId,
  });

  return createBudgetPageFormStateResult({
    visibilityState,
    inputState,
    closeExpenseForm,
    openExpenseForm,
  });
};
