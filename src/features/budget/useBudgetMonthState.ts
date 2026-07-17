import { useState } from "react";
import type { BudgetViewState } from "./budgetViewStateActions";
import { toMonthKey } from "./utils/date";
import {
  createBudgetMonthNavigationHandler,
  createBudgetMonthSyncAction,
} from "./budgetPageStateActions";

type BudgetMonthInitialState = Pick<
  BudgetViewState,
  "currentDate" | "expenses" | "expenseDate"
>;

type UseBudgetMonthStateParams = {
  initialState: BudgetMonthInitialState;
};

export const useBudgetMonthState = ({
  initialState,
}: UseBudgetMonthStateParams) => {
  const [currentDate, setCurrentDate] = useState(initialState.currentDate);
  const [expenses, setExpenses] = useState(() => initialState.expenses);
  const [expenseDate, setExpenseDate] = useState(initialState.expenseDate);

  const syncMonthData = createBudgetMonthSyncAction({
    setExpenses,
    setExpenseDate,
  });

  return {
    currentDate,
    currentMonth: toMonthKey(currentDate),
    expenseDate,
    expenses,
    goToCurrentMonth: createBudgetMonthNavigationHandler({
      direction: "current",
      currentDate,
      setCurrentDate,
      syncMonthData,
    }),
    goToNextMonth: createBudgetMonthNavigationHandler({
      direction: "next",
      currentDate,
      setCurrentDate,
      syncMonthData,
    }),
    goToPreviousMonth: createBudgetMonthNavigationHandler({
      direction: "previous",
      currentDate,
      setCurrentDate,
      syncMonthData,
    }),
    setExpenseDate,
    setExpenses,
  };
};
