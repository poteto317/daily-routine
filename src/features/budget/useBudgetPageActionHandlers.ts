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
  expenseDescription: string;
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
  expenseDescription,
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
    expenseDescription,
    setExpenses,
    closeExpenseForm,
  });

  return createBudgetPageActionHandlersResult({
    handleAddExpense,
    handleDeleteExpense,
    handleSaveBudget,
  });
};
