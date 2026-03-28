import type { Expense } from "@/types/routine";

type BudgetPageStateResultArgs = {
  budgetInputValue: string;
  closeBudgetInput: () => void;
  closeExpenseForm: () => void;
  currentDate: Date;
  dailyBudget: number;
  dailyRemainingBudget: number;
  daysRemaining: number;
  expenseAmount: string;
  expenseDate: string;
  expenseDescription: string;
  expenses: Expense[];
  goToCurrentMonth: () => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  handleAddExpense: () => void;
  handleBudgetInputChange: (value: string) => void;
  handleDeleteExpense: (expenseId: string) => void;
  handleExpenseAmountChange: (value: string) => void;
  handleExpenseDateChange: (value: string) => void;
  handleExpenseDescriptionChange: (value: string) => void;
  handleSaveBudget: () => void;
  isCurrentMonth: boolean;
  monthBudget: number;
  openBudgetInput: () => void;
  openExpenseForm: () => void;
  remaining: number;
  showBudgetInput: boolean;
  showExpenseForm: boolean;
  totalExpense: number;
};

export const createBudgetPageStateResult = ({
  budgetInputValue,
  closeBudgetInput,
  closeExpenseForm,
  currentDate,
  dailyBudget,
  dailyRemainingBudget,
  daysRemaining,
  expenseAmount,
  expenseDate,
  expenseDescription,
  expenses,
  goToCurrentMonth,
  goToNextMonth,
  goToPreviousMonth,
  handleAddExpense,
  handleBudgetInputChange,
  handleDeleteExpense,
  handleExpenseAmountChange,
  handleExpenseDateChange,
  handleExpenseDescriptionChange,
  handleSaveBudget,
  isCurrentMonth,
  monthBudget,
  openBudgetInput,
  openExpenseForm,
  remaining,
  showBudgetInput,
  showExpenseForm,
  totalExpense,
}: BudgetPageStateResultArgs) => {
  return {
    budgetInputValue,
    closeBudgetInput,
    closeExpenseForm,
    currentDate,
    dailyBudget,
    dailyRemainingBudget,
    daysRemaining,
    expenseAmount,
    expenseDate,
    expenseDescription,
    expenses,
    goToCurrentMonth,
    goToNextMonth,
    goToPreviousMonth,
    handleAddExpense,
    handleBudgetInputChange,
    handleDeleteExpense,
    handleExpenseAmountChange,
    handleExpenseDateChange,
    handleExpenseDescriptionChange,
    handleSaveBudget,
    isCurrentMonth,
    monthBudget,
    openBudgetInput,
    openExpenseForm,
    remaining,
    showBudgetInput,
    showExpenseForm,
    totalExpense,
  };
};
