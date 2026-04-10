import type { Expense } from "@/types/routine";
import { getMonthStateSnapshot } from "./budgetPageStateHelpers";
import {
  buildBudgetSavePayload,
  buildExpensePayload,
} from "./budgetPageStateLogic";
import {
  addExpenseFromInput,
  deleteExpenseAndRefresh,
  saveBudgetFromInput,
} from "./stateActions";
import { addExpense, deleteExpense, setMonthlyBudget } from "./storage";

type SetValue<T> = (value: T) => void;

export const createBudgetSaveHandler = (params: {
  currentMonth: string;
  budgetInputValue: string;
  setMonthBudget: SetValue<number>;
  closeBudgetInput: () => void;
}) => {
  const { currentMonth, budgetInputValue, setMonthBudget, closeBudgetInput } =
    params;

  return () => {
    saveBudgetFromInput({
      currentMonth,
      budgetInputValue,
      buildPayload: buildBudgetSavePayload,
      saveBudget: setMonthlyBudget,
      setMonthBudget,
      closeBudgetInput,
    });
  };
};

export const createExpenseAddHandler = (params: {
  expenseAmount: string;
  expenseDate: string;
  expenseDescription: string;
  currentDate: Date;
  setExpenses: SetValue<Expense[]>;
  closeExpenseForm: () => void;
}) => {
  const {
    expenseAmount,
    expenseDate,
    expenseDescription,
    currentDate,
    setExpenses,
    closeExpenseForm,
  } = params;

  return () => {
    addExpenseFromInput({
      expenseAmount,
      expenseDate,
      expenseDescription,
      buildPayload: buildExpensePayload,
      saveExpense: addExpense,
      currentDate,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
      closeExpenseForm,
    });
  };
};

export const createExpenseDeleteHandler = (params: {
  currentMonth: string;
  currentDate: Date;
  setExpenses: SetValue<Expense[]>;
}) => {
  const { currentMonth, currentDate, setExpenses } = params;

  return (expenseId: string) => {
    deleteExpenseAndRefresh({
      currentMonth,
      expenseId,
      deleteExpense,
      currentDate,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
    });
  };
};
