import type { Dispatch, SetStateAction } from "react";
import type { Expense } from "@/types/routine";

type BudgetExpenseEditStateResultArgs = {
  editingExpenseId: string | null;
  editingExpenseDate: string;
  editingExpenseAmount: string;
  editingExpenseCategoryId: string;
  setEditingExpenseDate: Dispatch<SetStateAction<string>>;
  setEditingExpenseAmount: Dispatch<SetStateAction<string>>;
  setEditingExpenseCategoryId: Dispatch<SetStateAction<string>>;
  startEditExpense: (expense: Expense) => void;
  cancelEditExpense: () => void;
};

export const createBudgetExpenseEditStateResult = ({
  editingExpenseId,
  editingExpenseDate,
  editingExpenseAmount,
  editingExpenseCategoryId,
  setEditingExpenseDate,
  setEditingExpenseAmount,
  setEditingExpenseCategoryId,
  startEditExpense,
  cancelEditExpense,
}: BudgetExpenseEditStateResultArgs) => {
  return {
    editingExpenseId,
    editingExpenseDate,
    editingExpenseAmount,
    editingExpenseCategoryId,
    setEditingExpenseDate,
    setEditingExpenseAmount,
    setEditingExpenseCategoryId,
    startEditExpense,
    cancelEditExpense,
  };
};
