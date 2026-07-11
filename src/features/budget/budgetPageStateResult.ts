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
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  expenses: Expense[];
  goToCurrentMonth: () => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  handleAddExpense: () => void;
  handleBudgetInputChange: (value: string) => void;
  handleDeleteExpense: (expenseId: string) => void;
  handleExpenseAmountChange: (value: string) => void;
  handleExpenseDateChange: (value: string) => void;
  handleExpenseCategoryIdChange: (value: string) => void;
  handleSaveBudget: () => void;
  isCurrentMonth: boolean;
  monthBudget: number;
  navigateToCategoryManagement: () => void;
  openBudgetInput: () => void;
  openExpenseForm: () => void;
  remaining: number;
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
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  expenses,
  goToCurrentMonth,
  goToNextMonth,
  goToPreviousMonth,
  handleAddExpense,
  handleBudgetInputChange,
  handleDeleteExpense,
  handleExpenseAmountChange,
  handleExpenseDateChange,
  handleExpenseCategoryIdChange,
  handleSaveBudget,
  isCurrentMonth,
  monthBudget,
  navigateToCategoryManagement,
  openBudgetInput,
  openExpenseForm,
  remaining,
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
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    expenses,
    goToCurrentMonth,
    goToNextMonth,
    goToPreviousMonth,
    handleAddExpense,
    handleBudgetInputChange,
    handleDeleteExpense,
    handleExpenseAmountChange,
    handleExpenseDateChange,
    handleExpenseCategoryIdChange,
    handleSaveBudget,
    isCurrentMonth,
    monthBudget,
    navigateToCategoryManagement,
    openBudgetInput,
    openExpenseForm,
    remaining,
    showBudgetInput,
    showExpenseForm,
    todayExpense,
    totalExpense,
  };
};
