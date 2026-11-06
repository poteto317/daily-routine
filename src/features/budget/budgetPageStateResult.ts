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
  /** 日付のボタン・「➕」でフォームを開いた回数（フォームを見える位置へスクロールする合図） */
  formOpenRequest: number;
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
  /** 未入力の日（今月の 1 日〜昨日で支出の記録が無い日。昇順の "YYYY-MM-DD"） */
  missingExpenseDates: string[];
  navigateToCategoryManagement: () => void;
  navigateToSummary: () => void;
  openExpenseForm: () => void;
  /** 日付を入れて支出の追加フォームを開く（未入力の日のボタン） */
  startAddExpenseOnDate: (date: string) => void;
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
  formOpenRequest,
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
  missingExpenseDates,
  navigateToCategoryManagement,
  navigateToSummary,
  openExpenseForm,
  startAddExpenseOnDate,
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
    formOpenRequest,
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
    missingExpenseDates,
    navigateToCategoryManagement,
    navigateToSummary,
    openExpenseForm,
    startAddExpenseOnDate,
    startEditExpense,
    cancelEditExpense,
    showExpenseForm,
    todayExpense,
  };
};
