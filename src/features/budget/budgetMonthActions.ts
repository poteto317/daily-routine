import type { Expense } from "@/types/routine";
import { getMonthStateSnapshot } from "./budgetPageStateHelpers";
import { createBudgetMonthNavigationDate } from "./budgetViewStateActions";
import { navigateBudgetMonth, syncBudgetMonthData } from "./stateActions";

type SetValue<T> = (value: T) => void;

export const createBudgetMonthSyncAction = (params: {
  setExpenses: SetValue<Expense[]>;
  setExpenseDate: SetValue<string>;
}) => {
  const { setExpenses, setExpenseDate } = params;

  return (date: Date) => {
    syncBudgetMonthData({
      date,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
      setExpenseDate,
    });
  };
};

export const createBudgetMonthNavigationHandler = (params: {
  direction: "current" | "next" | "previous";
  currentDate: Date;
  setCurrentDate: SetValue<Date>;
  syncMonthData: (date: Date) => void;
}) => {
  const { direction, currentDate, setCurrentDate, syncMonthData } = params;

  return () => {
    navigateBudgetMonth({
      nextDate: createBudgetMonthNavigationDate({
        direction,
        currentDate,
      }),
      setCurrentDate,
      syncMonthData,
    });
  };
};
