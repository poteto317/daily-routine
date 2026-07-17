import type { BudgetCategory, Expense } from "@/types/routine";
import type { MonthlyAllowance } from "./utils/monthlyAllowance";

type BudgetPageStateResultArgs = {
  categories: BudgetCategory[];
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
  handleDeleteExpense: (expenseId: string) => void;
  handleExpenseAmountChange: (value: string) => void;
  handleExpenseDateChange: (value: string) => void;
  handleExpenseCategoryIdChange: (value: string) => void;
  handleEditExpenseAmountChange: (value: string) => void;
  handleEditExpenseDateChange: (value: string) => void;
  handleEditExpenseCategoryIdChange: (value: string) => void;
  isCurrentMonth: boolean;
  monthBudget: number;
  monthlyAllowance: MonthlyAllowance;
  navigateToCategoryManagement: () => void;
  navigateToAllowanceSettings: () => void;
  openExpenseForm: () => void;
  remaining: number;
  startEditExpense: (expense: Expense) => void;
  cancelEditExpense: () => void;
  showExpenseForm: boolean;
  todayExpense: number;
  totalExpense: number;
};

export const createBudgetPageStateResult = ({
  categories,
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
  handleDeleteExpense,
  handleExpenseAmountChange,
  handleExpenseDateChange,
  handleExpenseCategoryIdChange,
  handleEditExpenseAmountChange,
  handleEditExpenseDateChange,
  handleEditExpenseCategoryIdChange,
  isCurrentMonth,
  monthBudget,
  monthlyAllowance,
  navigateToCategoryManagement,
  navigateToAllowanceSettings,
  openExpenseForm,
  remaining,
  startEditExpense,
  cancelEditExpense,
  showExpenseForm,
  todayExpense,
  totalExpense,
}: BudgetPageStateResultArgs) => {
  return {
    categories,
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
    handleDeleteExpense,
    handleExpenseAmountChange,
    handleExpenseDateChange,
    handleExpenseCategoryIdChange,
    handleEditExpenseAmountChange,
    handleEditExpenseDateChange,
    handleEditExpenseCategoryIdChange,
    isCurrentMonth,
    monthBudget,
    monthlyAllowance,
    navigateToCategoryManagement,
    navigateToAllowanceSettings,
    openExpenseForm,
    remaining,
    startEditExpense,
    cancelEditExpense,
    showExpenseForm,
    todayExpense,
    totalExpense,
  };
};
