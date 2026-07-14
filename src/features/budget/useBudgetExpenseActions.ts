import type { Expense } from "@/types/routine";
import { createBudgetExpenseActionsResult } from "./budgetExpenseActionsResult";
import {
  createExpenseAddHandler,
  createExpenseDeleteHandler,
  createExpenseUpdateHandler,
} from "./budgetPageStateActions";

type UseBudgetExpenseActionsParams = {
  currentMonth: string;
  currentDate: Date;
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  editingExpenseId: string | null;
  editingExpenseAmount: string;
  editingExpenseDate: string;
  editingExpenseCategoryId: string;
  setExpenses: (value: Expense[]) => void;
  closeExpenseForm: () => void;
  closeExpenseEdit: () => void;
};

export const useBudgetExpenseActions = ({
  currentMonth,
  currentDate,
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  editingExpenseId,
  editingExpenseAmount,
  editingExpenseDate,
  editingExpenseCategoryId,
  setExpenses,
  closeExpenseForm,
  closeExpenseEdit,
}: UseBudgetExpenseActionsParams) => {
  const handleAddExpense = createExpenseAddHandler({
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    currentDate,
    setExpenses,
    closeExpenseForm,
  });

  const handleUpdateExpense = createExpenseUpdateHandler({
    currentMonth,
    editingExpenseId,
    editingExpenseAmount,
    editingExpenseDate,
    editingExpenseCategoryId,
    currentDate,
    setExpenses,
    closeExpenseEdit,
  });

  const handleDeleteExpense = createExpenseDeleteHandler({
    currentMonth,
    currentDate,
    setExpenses,
  });

  return createBudgetExpenseActionsResult({
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
  });
};
