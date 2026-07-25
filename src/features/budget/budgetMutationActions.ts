import type { Expense } from "@/types/routine";
import { getMonthStateSnapshot } from "./budgetPageStateHelpers";
import { buildExpensePayload } from "./budgetPageStateLogic";
import {
  addExpenseFromInput,
  deleteExpenseAndRefresh,
  updateExpenseFromInput,
} from "./stateActions";
import { addExpense, deleteExpense, updateExpense } from "./storage";

type SetValue<T> = (value: T) => void;

export const createExpenseAddHandler = (params: {
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  currentDate: Date;
  setExpenses: SetValue<Expense[]>;
  closeExpenseForm: () => void;
}) => {
  const {
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    currentDate,
    setExpenses,
    closeExpenseForm,
  } = params;

  return () => {
    addExpenseFromInput({
      expenseAmount,
      expenseDate,
      expenseCategoryId,
      buildPayload: buildExpensePayload,
      saveExpense: addExpense,
      currentDate,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
      closeExpenseForm,
    });
  };
};

export const createExpenseUpdateHandler = (params: {
  currentMonth: string;
  editingExpenseId: string | null;
  editingExpenseAmount: string;
  editingExpenseDate: string;
  editingExpenseCategoryId: string;
  editingExpenseUsedTime: string;
  currentDate: Date;
  setExpenses: SetValue<Expense[]>;
  closeExpenseEdit: () => void;
}) => {
  const {
    currentMonth,
    editingExpenseId,
    editingExpenseAmount,
    editingExpenseDate,
    editingExpenseCategoryId,
    editingExpenseUsedTime,
    currentDate,
    setExpenses,
    closeExpenseEdit,
  } = params;

  return () => {
    if (!editingExpenseId) {
      return;
    }

    updateExpenseFromInput({
      currentMonth,
      expenseId: editingExpenseId,
      expenseAmount: editingExpenseAmount,
      expenseDate: editingExpenseDate,
      expenseCategoryId: editingExpenseCategoryId,
      expenseUsedTime: editingExpenseUsedTime,
      buildPayload: buildExpensePayload,
      saveExpense: updateExpense,
      currentDate,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
      closeExpenseEdit,
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
