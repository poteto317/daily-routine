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
  setMonthBudget: (value: number) => void;
  setExpenses: (value: Expense[]) => void;
  closeBudgetInput: () => void;
  closeExpenseForm: () => void;
};

export const useBudgetPageActionHandlers = ({
  currentMonth,
  currentDate,
  budgetInputValue,
  expenseAmount,
  expenseDate,
  expenseCategoryId,
  setMonthBudget,
  setExpenses,
  closeBudgetInput,
  closeExpenseForm,
}: UseBudgetPageActionHandlersParams) => {
  const { handleSaveBudget } = useBudgetSaveAction({
    currentMonth,
    budgetInputValue,
    setMonthBudget,
    closeBudgetInput,
  });

  const { handleAddExpense, handleDeleteExpense } = useBudgetExpenseActions({
    currentMonth,
    currentDate,
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    setExpenses,
    closeExpenseForm,
  });

  return createBudgetPageActionHandlersResult({
    handleAddExpense,
    handleDeleteExpense,
    handleSaveBudget,
  });
};
