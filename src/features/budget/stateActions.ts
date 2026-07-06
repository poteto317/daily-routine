import type { Expense } from "@/types/routine";
import type { MonthStateSnapshot } from "./budgetPageStateHelpers";
import type { BudgetSavePayload, ExpensePayload } from "./budgetPageStateLogic";

type SetValue<T> = (value: T) => void;

export const applyMonthSnapshot = (params: {
  snapshot: MonthStateSnapshot;
  setMonthBudget: SetValue<number>;
  setExpenses: SetValue<Expense[]>;
  setExpenseDate: SetValue<string>;
}): void => {
  const { snapshot, setMonthBudget, setExpenses, setExpenseDate } = params;

  setMonthBudget(snapshot.monthBudget);
  setExpenses(snapshot.expenses);
  setExpenseDate(snapshot.defaultExpenseDate);
};

export const syncBudgetMonthData = (params: {
  date: Date;
  getSnapshot: (date: Date) => MonthStateSnapshot;
  setMonthBudget: SetValue<number>;
  setExpenses: SetValue<Expense[]>;
  setExpenseDate: SetValue<string>;
}): MonthStateSnapshot => {
  const { date, getSnapshot, setMonthBudget, setExpenses, setExpenseDate } =
    params;
  const snapshot = getSnapshot(date);

  applyMonthSnapshot({
    snapshot,
    setMonthBudget,
    setExpenses,
    setExpenseDate,
  });

  return snapshot;
};

export const closeBudgetInputForm = (params: {
  setShowBudgetInput: SetValue<boolean>;
  setBudgetInputValue: SetValue<string>;
}): void => {
  const { setShowBudgetInput, setBudgetInputValue } = params;

  setShowBudgetInput(false);
  setBudgetInputValue("");
};

export const closeExpenseInputForm = (params: {
  setShowExpenseForm: SetValue<boolean>;
  setExpenseAmount: SetValue<string>;
  setExpenseCategoryId: SetValue<string>;
}): void => {
  const { setShowExpenseForm, setExpenseAmount, setExpenseCategoryId } =
    params;

  setShowExpenseForm(false);
  setExpenseAmount("");
  setExpenseCategoryId("");
};

export const openBudgetInputForm = (params: {
  monthBudget: number;
  getInitialValue: (monthBudget: number) => string;
  setBudgetInputValue: SetValue<string>;
  setShowBudgetInput: SetValue<boolean>;
}): void => {
  const {
    monthBudget,
    getInitialValue,
    setBudgetInputValue,
    setShowBudgetInput,
  } = params;

  setBudgetInputValue(getInitialValue(monthBudget));
  setShowBudgetInput(true);
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

export const saveBudgetFromInput = (params: {
  currentMonth: string;
  budgetInputValue: string;
  buildPayload: (
    monthKey: string,
    budgetInputValue: string,
  ) => BudgetSavePayload | null;
  saveBudget: (monthKey: string, amount: number) => void;
  setMonthBudget: SetValue<number>;
  closeBudgetInput: () => void;
}): boolean => {
  const {
    currentMonth,
    budgetInputValue,
    buildPayload,
    saveBudget,
    setMonthBudget,
    closeBudgetInput,
  } = params;
  const payload = buildPayload(currentMonth, budgetInputValue);

  if (!payload) {
    return false;
  }

  saveBudget(payload.monthKey, payload.amount);
  setMonthBudget(payload.amount);
  closeBudgetInput();
  return true;
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
