import type { BudgetCategory, Expense } from "@/types/routine";

type BudgetPageStateResultArgs = {
  categories: BudgetCategory[];
  closeExpenseForm: () => void;
  currentDate: Date;
  dailyRemainingBudget: number;
  editingExpenseId: string | null;
  editingExpenseAmount: string;
  editingExpenseDate: string;
  editingExpenseCategoryId: string;
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  expenses: Expense[];
  goToCurrentMonth: () => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  handleAddExpense: () => void;
  handleUpdateExpense: () => void;
  handleDeleteExpense: (expenseId: string) => void;
  handleExpenseAmountChange: (value: string) => void;
  handleExpenseDateChange: (value: string) => void;
  handleExpenseCategoryIdChange: (value: string) => void;
  handleEditExpenseAmountChange: (value: string) => void;
  handleEditExpenseDateChange: (value: string) => void;
  handleEditExpenseCategoryIdChange: (value: string) => void;
  isCurrentMonth: boolean;
  navigateToCategoryManagement: () => void;
  navigateToSummary: () => void;
  openExpenseForm: () => void;
  startEditExpense: (expense: Expense) => void;
  cancelEditExpense: () => void;
  showExpenseForm: boolean;
  todayExpense: number;
};

export const createBudgetPageStateResult = ({
  categories,
  closeExpenseForm,
  currentDate,
  dailyRemainingBudget,
  editingExpenseId,
  editingExpenseAmount,
  editingExpenseDate,
  editingExpenseCategoryId,
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  expenses,
  goToCurrentMonth,
  goToNextMonth,
  goToPreviousMonth,
  handleAddExpense,
  handleUpdateExpense,
  handleDeleteExpense,
  handleExpenseAmountChange,
  handleExpenseDateChange,
  handleExpenseCategoryIdChange,
  handleEditExpenseAmountChange,
  handleEditExpenseDateChange,
  handleEditExpenseCategoryIdChange,
  isCurrentMonth,
  navigateToCategoryManagement,
  navigateToSummary,
  openExpenseForm,
  startEditExpense,
  cancelEditExpense,
  showExpenseForm,
  todayExpense,
}: BudgetPageStateResultArgs) => {
  return {
    categories,
    closeExpenseForm,
    currentDate,
    dailyRemainingBudget,
    editingExpenseId,
    editingExpenseAmount,
    editingExpenseDate,
    editingExpenseCategoryId,
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    expenses,
    goToCurrentMonth,
    goToNextMonth,
    goToPreviousMonth,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleExpenseAmountChange,
    handleExpenseDateChange,
    handleExpenseCategoryIdChange,
    handleEditExpenseAmountChange,
    handleEditExpenseDateChange,
    handleEditExpenseCategoryIdChange,
    isCurrentMonth,
    navigateToCategoryManagement,
    navigateToSummary,
    openExpenseForm,
    startEditExpense,
    cancelEditExpense,
    showExpenseForm,
    todayExpense,
  };
};
