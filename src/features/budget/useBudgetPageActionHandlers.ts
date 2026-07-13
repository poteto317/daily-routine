import type { Expense } from "@/types/routine";
import { createBudgetPageActionHandlersResult } from "./budgetPageActionHandlersResult";
import { useBudgetExpenseActions } from "./useBudgetExpenseActions";
import { useBudgetSaveAction } from "./useBudgetSaveAction";

type UseBudgetPageActionHandlersParams = {
  currentMonth: string;
  currentDate: Date;
  budgetInputValue: string;
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  editingExpenseId: string | null;
  editingExpenseAmount: string;
  editingExpenseDate: string;
  editingExpenseCategoryId: string;
  setMonthBudget: (value: number) => void;
  setExpenses: (value: Expense[]) => void;
  closeBudgetInput: () => void;
  closeExpenseForm: () => void;
  closeExpenseEdit: () => void;
};

export const useBudgetPageActionHandlers = ({
  currentMonth,
  currentDate,
  budgetInputValue,
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  editingExpenseId,
  editingExpenseAmount,
  editingExpenseDate,
  editingExpenseCategoryId,
  setMonthBudget,
  setExpenses,
  closeBudgetInput,
  closeExpenseForm,
  closeExpenseEdit,
}: UseBudgetPageActionHandlersParams) => {
  const { handleSaveBudget } = useBudgetSaveAction({
    currentMonth,
    budgetInputValue,
    setMonthBudget,
    closeBudgetInput,
  });

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
    handleSaveBudget,
  });
};
