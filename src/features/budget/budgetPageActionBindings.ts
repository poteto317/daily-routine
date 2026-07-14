import type { Expense } from "@/types/routine";

type BudgetPageActionBindingsArgs = {
  budgetInputValue: string;
  closeBudgetInput: () => void;
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
  setExpenses: (value: Expense[]) => void;
  setMonthBudget: (value: number) => void;
};

export const createBudgetPageActionBindings = ({
  budgetInputValue,
  closeBudgetInput,
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
  setExpenses,
  setMonthBudget,
}: BudgetPageActionBindingsArgs) => {
  return {
    budgetInputValue,
    closeBudgetInput,
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
    setExpenses,
    setMonthBudget,
  };
};
