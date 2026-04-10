import { getBudgetInputInitialValue } from "./budgetPageStateLogic";
import { createOpenedExpenseFormState } from "./budgetViewStateActions";
import {
  closeBudgetInputForm,
  closeExpenseInputForm,
  openBudgetInputForm,
} from "./stateActions";

type SetValue<T> = (value: T) => void;

export const createBudgetInputCloseHandler = (params: {
  setShowBudgetInput: SetValue<boolean>;
  setBudgetInputValue: SetValue<string>;
}) => {
  return () => {
    closeBudgetInputForm(params);
  };
};

export const createExpenseFormCloseHandler = (params: {
  setShowExpenseForm: SetValue<boolean>;
  setExpenseAmount: SetValue<string>;
  setExpenseDescription: SetValue<string>;
}) => {
  return () => {
    closeExpenseInputForm(params);
  };
};

export const createBudgetInputOpenHandler = (params: {
  monthBudget: number;
  setBudgetInputValue: SetValue<string>;
  setShowBudgetInput: SetValue<boolean>;
}) => {
  const { monthBudget, setBudgetInputValue, setShowBudgetInput } = params;

  return () => {
    openBudgetInputForm({
      monthBudget,
      getInitialValue: getBudgetInputInitialValue,
      setBudgetInputValue,
      setShowBudgetInput,
    });
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
