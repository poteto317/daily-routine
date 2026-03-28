import type { Expense } from "@/types/routine";

type BudgetPageActionBindingsArgs = {
  budgetInputValue: string;
  closeBudgetInput: () => void;
  closeExpenseForm: () => void;
  currentDate: Date;
  currentMonth: string;
  expenseAmount: string;
  expenseDate: string;
  expenseDescription: string;
  setExpenses: (value: Expense[]) => void;
  setMonthBudget: (value: number) => void;
};

export const createBudgetPageActionBindings = ({
  budgetInputValue,
  closeBudgetInput,
  closeExpenseForm,
  currentDate,
  currentMonth,
  expenseAmount,
  expenseDate,
  expenseDescription,
  setExpenses,
  setMonthBudget,
}: BudgetPageActionBindingsArgs) => {
  return {
    budgetInputValue,
    closeBudgetInput,
    closeExpenseForm,
    currentDate,
    currentMonth,
    expenseAmount,
    expenseDate,
    expenseDescription,
    setExpenses,
    setMonthBudget,
  };
};
