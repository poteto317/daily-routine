import type { Expense } from "@/types/routine";
import type { MonthStateSnapshot } from "./budgetPageStateHelpers";
import { shiftMonth } from "./utils/date";

export type BudgetViewState = {
  currentDate: Date;
  expenses: Expense[];
  showExpenseForm: boolean;
  expenseAmount: string;
  expenseCategoryId: string;
  expenseDate: string;
};

type BudgetNavigationDirection = "current" | "next" | "previous";

export const createInitialBudgetViewState = (
  initialDate: Date,
  initialSnapshot: MonthStateSnapshot,
): BudgetViewState => {
  return {
    currentDate: initialDate,
    expenses: initialSnapshot.expenses,
    showExpenseForm: false,
    expenseAmount: "",
    expenseCategoryId: "",
    expenseDate: initialSnapshot.defaultExpenseDate,
  };
};

export const createBudgetMonthNavigationDate = (params: {
  direction: BudgetNavigationDirection;
  currentDate: Date;
  today?: Date;
}): Date => {
  const { direction, currentDate, today = new Date() } = params;

  switch (direction) {
    case "current":
      return today;
    case "next":
      return shiftMonth(currentDate, 1);
    case "previous":
      return shiftMonth(currentDate, -1);
  }
};

export const createOpenedExpenseFormState = () => {
  return {
    showExpenseForm: true,
  };
};
