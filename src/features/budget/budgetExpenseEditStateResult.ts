import type { Dispatch, SetStateAction } from "react";
import type { Expense } from "@/types/routine";

type BudgetExpenseEditStateResultArgs = {
  editingExpenseId: string | null;
  editingExpenseDate: string;
  editingExpenseAmount: string;
  editingExpenseCategoryId: string;
  editingExpenseUsedTime: string;
  setEditingExpenseDate: Dispatch<SetStateAction<string>>;
  setEditingExpenseAmount: Dispatch<SetStateAction<string>>;
  setEditingExpenseCategoryId: Dispatch<SetStateAction<string>>;
  setEditingExpenseUsedTime: Dispatch<SetStateAction<string>>;
  startEditExpense: (expense: Expense) => void;
  cancelEditExpense: () => void;
};

export const createBudgetExpenseEditStateResult = ({
  editingExpenseId,
  editingExpenseDate,
  editingExpenseAmount,
  editingExpenseCategoryId,
  editingExpenseUsedTime,
  setEditingExpenseDate,
  setEditingExpenseAmount,
  setEditingExpenseCategoryId,
  setEditingExpenseUsedTime,
  startEditExpense,
  cancelEditExpense,
}: BudgetExpenseEditStateResultArgs) => {
  return {
    editingExpenseId,
    editingExpenseDate,
    editingExpenseAmount,
    editingExpenseCategoryId,
    editingExpenseUsedTime,
    setEditingExpenseDate,
    setEditingExpenseAmount,
    setEditingExpenseCategoryId,
    setEditingExpenseUsedTime,
    startEditExpense,
    cancelEditExpense,
  };
};
