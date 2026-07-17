import { createOpenedExpenseFormState } from "./budgetViewStateActions";
import { closeExpenseInputForm } from "./stateActions";

type SetValue<T> = (value: T) => void;

export const createExpenseFormCloseHandler = (params: {
  setShowExpenseForm: SetValue<boolean>;
  setExpenseAmount: SetValue<string>;
  setExpenseCategoryId: SetValue<string>;
}) => {
  return () => {
    closeExpenseInputForm(params);
  };
};

export const createExpenseFormOpenHandler = (params: {
  setShowExpenseForm: SetValue<boolean>;
}) => {
  const { setShowExpenseForm } = params;

  return () => {
    setShowExpenseForm(createOpenedExpenseFormState().showExpenseForm);
  };
};
