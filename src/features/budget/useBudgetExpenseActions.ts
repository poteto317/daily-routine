import type { Expense } from "@/types/routine";
import { createBudgetExpenseActionsResult } from "./budgetExpenseActionsResult";
import {
  createExpenseAddHandler,
  createExpenseDeleteHandler,
} from "./budgetPageStateActions";

type UseBudgetExpenseActionsParams = {
  currentMonth: string;
  currentDate: Date;
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  setExpenses: (value: Expense[]) => void;
  closeExpenseForm: () => void;
};

export const useBudgetExpenseActions = ({
  currentMonth,
  currentDate,
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  setExpenses,
  closeExpenseForm,
}: UseBudgetExpenseActionsParams) => {
  const handleAddExpense = createExpenseAddHandler({
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    currentDate,
    setExpenses,
    closeExpenseForm,
  });

  const handleDeleteExpense = createExpenseDeleteHandler({
    currentMonth,
    currentDate,
    setExpenses,
  });

  return createBudgetExpenseActionsResult({
    handleAddExpense,
    handleDeleteExpense,
  });
};
