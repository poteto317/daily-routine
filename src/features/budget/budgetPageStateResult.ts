import type { BudgetCategory, Expense } from "@/types/routine";

type BudgetPageStateResultArgs = {
  budgetInputValue: string;
  categories: BudgetCategory[];
  closeBudgetInput: () => void;
  closeExpenseForm: () => void;
  currentDate: Date;
  dailyBudget: number;
  dailyRemainingBudget: number;
  daysRemaining: number;
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
  handleBudgetInputChange: (value: string) => void;
  handleDeleteExpense: (expenseId: string) => void;
  handleExpenseAmountChange: (value: string) => void;
  handleExpenseDateChange: (value: string) => void;
  handleExpenseCategoryIdChange: (value: string) => void;
  handleEditExpenseAmountChange: (value: string) => void;
  handleEditExpenseDateChange: (value: string) => void;
  handleEditExpenseCategoryIdChange: (value: string) => void;
  handleSaveBudget: () => void;
  isCurrentMonth: boolean;
  monthBudget: number;
  navigateToCategoryManagement: () => void;
  openBudgetInput: () => void;
  openExpenseForm: () => void;
  remaining: number;
  startEditExpense: (expense: Expense) => void;
  cancelEditExpense: () => void;
  showBudgetInput: boolean;
  showExpenseForm: boolean;
  todayExpense: number;
  totalExpense: number;
};

export const createBudgetPageStateResult = ({
  budgetInputValue,
  categories,
  closeBudgetInput,
  closeExpenseForm,
  currentDate,
  dailyBudget,
  dailyRemainingBudget,
  daysRemaining,
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
  handleBudgetInputChange,
  handleDeleteExpense,
  handleExpenseAmountChange,
  handleExpenseDateChange,
  handleExpenseCategoryIdChange,
  handleEditExpenseAmountChange,
  handleEditExpenseDateChange,
  handleEditExpenseCategoryIdChange,
  handleSaveBudget,
  isCurrentMonth,
  monthBudget,
  navigateToCategoryManagement,
  openBudgetInput,
  openExpenseForm,
  remaining,
  startEditExpense,
  cancelEditExpense,
  showBudgetInput,
  showExpenseForm,
  todayExpense,
  totalExpense,
}: BudgetPageStateResultArgs) => {
  return {
    budgetInputValue,
    categories,
    closeBudgetInput,
    closeExpenseForm,
    currentDate,
    dailyBudget,
    dailyRemainingBudget,
    daysRemaining,
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
    handleBudgetInputChange,
    handleDeleteExpense,
    handleExpenseAmountChange,
    handleExpenseDateChange,
    handleExpenseCategoryIdChange,
    handleEditExpenseAmountChange,
    handleEditExpenseDateChange,
    handleEditExpenseCategoryIdChange,
    handleSaveBudget,
    isCurrentMonth,
    monthBudget,
    navigateToCategoryManagement,
    openBudgetInput,
    openExpenseForm,
    remaining,
    startEditExpense,
    cancelEditExpense,
    showBudgetInput,
    showExpenseForm,
    todayExpense,
    totalExpense,
  };
};
