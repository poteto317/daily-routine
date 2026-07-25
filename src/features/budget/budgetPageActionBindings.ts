import type { Expense } from "@/types/routine";

type BudgetPageActionBindingsArgs = {
  closeExpenseForm: () => void;
  closeExpenseEdit: () => void;
  currentDate: Date;
  currentMonth: string;
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  editingExpenseId: string | null;
  editingExpenseAmount: string;
  editingExpenseDate: string;
  editingExpenseCategoryId: string;
  editingExpenseUsedTime: string;
  setExpenses: (value: Expense[]) => void;
};

export const createBudgetPageActionBindings = ({
  closeExpenseForm,
  closeExpenseEdit,
  currentDate,
  currentMonth,
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  editingExpenseId,
  editingExpenseAmount,
  editingExpenseDate,
  editingExpenseCategoryId,
  editingExpenseUsedTime,
  setExpenses,
}: BudgetPageActionBindingsArgs) => {
  return {
    closeExpenseForm,
    closeExpenseEdit,
    currentDate,
    currentMonth,
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    editingExpenseId,
    editingExpenseAmount,
    editingExpenseDate,
    editingExpenseCategoryId,
    editingExpenseUsedTime,
    setExpenses,
  };
};
