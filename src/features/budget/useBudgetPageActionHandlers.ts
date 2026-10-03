import type { Expense } from "@/types/routine";
import { createBudgetPageActionHandlersResult } from "./budgetPageActionHandlersResult";
import { useBudgetExpenseActions } from "./useBudgetExpenseActions";

type UseBudgetPageActionHandlersParams = {
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

export const useBudgetPageActionHandlers = ({
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
}: UseBudgetPageActionHandlersParams) => {
  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } =
    useBudgetExpenseActions({
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
    });

  return createBudgetPageActionHandlersResult({
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
  });
};
