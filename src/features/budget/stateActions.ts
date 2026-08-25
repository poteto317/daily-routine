import type { Expense } from "@/types/routine";
import type { MonthStateSnapshot } from "./budgetPageStateHelpers";
import type { ExpensePayload } from "./budgetPageStateLogic";

type SetValue<T> = (value: T) => void;

export const applyMonthSnapshot = (params: {
  snapshot: MonthStateSnapshot;
  setExpenses: SetValue<Expense[]>;
  setExpenseDate: SetValue<string>;
}): void => {
  const { snapshot, setExpenses, setExpenseDate } = params;

  setExpenses(snapshot.expenses);
  setExpenseDate(snapshot.defaultExpenseDate);
};

export const syncBudgetMonthData = (params: {
  date: Date;
  getSnapshot: (date: Date) => MonthStateSnapshot;
  setExpenses: SetValue<Expense[]>;
  setExpenseDate: SetValue<string>;
}): MonthStateSnapshot => {
  const { date, getSnapshot, setExpenses, setExpenseDate } = params;
  const snapshot = getSnapshot(date);

  applyMonthSnapshot({
    snapshot,
    setExpenses,
    setExpenseDate,
  });

  return snapshot;
};

export const closeExpenseInputForm = (params: {
  setShowExpenseForm: SetValue<boolean>;
  setExpenseAmount: SetValue<string>;
  setExpenseCategoryId: SetValue<string>;
}): void => {
  const { setShowExpenseForm, setExpenseAmount, setExpenseCategoryId } = params;

  setShowExpenseForm(false);
  setExpenseAmount("");
  setExpenseCategoryId("");
};

export const navigateBudgetMonth = (params: {
  nextDate: Date;
  setCurrentDate: SetValue<Date>;
  syncMonthData: (date: Date) => void;
}): void => {
  const { nextDate, setCurrentDate, syncMonthData } = params;

  setCurrentDate(nextDate);
  syncMonthData(nextDate);
};

export const addExpenseFromInput = (params: {
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  buildPayload: (params: {
    expenseAmount: string;
    expenseDate: string;
    expenseCategoryId: string;
  }) => ExpensePayload | null;
  saveExpense: (date: string, amount: number, categoryId?: string) => void;
  currentDate: Date;
  getSnapshot: (date: Date) => MonthStateSnapshot;
  setExpenses: SetValue<Expense[]>;
  closeExpenseForm: () => void;
}): boolean => {
  const {
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    buildPayload,
    saveExpense,
    currentDate,
    getSnapshot,
    setExpenses,
    closeExpenseForm,
  } = params;
  const payload = buildPayload({
    expenseAmount,
    expenseDate,
    expenseCategoryId,
  });

  if (!payload) {
    return false;
  }

  saveExpense(payload.date, payload.amount, payload.categoryId);
  setExpenses(getSnapshot(currentDate).expenses);
  closeExpenseForm();
  return true;
};

export const updateExpenseFromInput = (params: {
  currentMonth: string;
  expenseId: string;
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  expenseUsedTime: string;
  buildPayload: (params: {
    expenseAmount: string;
    expenseDate: string;
    expenseCategoryId: string;
  }) => ExpensePayload | null;
  saveExpense: (
    monthKey: string,
    expenseId: string,
    updates: {
      date: string;
      amount: number;
      categoryId?: string;
      usedTime: string;
    },
  ) => void;
  currentDate: Date;
  getSnapshot: (date: Date) => MonthStateSnapshot;
  setExpenses: SetValue<Expense[]>;
  closeExpenseEdit: () => void;
}): boolean => {
  const {
    currentMonth,
    expenseId,
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    expenseUsedTime,
    buildPayload,
    saveExpense,
    currentDate,
    getSnapshot,
    setExpenses,
    closeExpenseEdit,
  } = params;
  const payload = buildPayload({
    expenseAmount,
    expenseDate,
    expenseCategoryId,
  });

  if (!payload) {
    return false;
  }

  saveExpense(currentMonth, expenseId, {
    date: payload.date,
    amount: payload.amount,
    categoryId: payload.categoryId,
    usedTime: expenseUsedTime,
  });
  setExpenses(getSnapshot(currentDate).expenses);
  closeExpenseEdit();
  return true;
};

export const deleteExpenseAndRefresh = (params: {
  currentMonth: string;
  expenseId: string;
  deleteExpense: (monthKey: string, expenseId: string) => void;
  currentDate: Date;
  getSnapshot: (date: Date) => MonthStateSnapshot;
  setExpenses: SetValue<Expense[]>;
}): void => {
  const {
    currentMonth,
    expenseId,
    deleteExpense,
    currentDate,
    getSnapshot,
    setExpenses,
  } = params;

  deleteExpense(currentMonth, expenseId);
  setExpenses(getSnapshot(currentDate).expenses);
};
