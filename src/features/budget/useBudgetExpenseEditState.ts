import { useCallback, useState } from "react";
import type { Expense } from "@/types/routine";
import { resolveExpenseUsedTime } from "./budgetExpenseListSort";
import { createBudgetExpenseEditStateResult } from "./budgetExpenseEditStateResult";

/** 支出一覧のインライン編集状態（対象IDと編集中の入力値）を管理する。 */
export const useBudgetExpenseEditState = () => {
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingExpenseDate, setEditingExpenseDate] = useState("");
  const [editingExpenseAmount, setEditingExpenseAmount] = useState("");
  const [editingExpenseCategoryId, setEditingExpenseCategoryId] = useState("");
  const [editingExpenseUsedTime, setEditingExpenseUsedTime] = useState("");

  const startEditExpense = useCallback((expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditingExpenseDate(expense.date);
    setEditingExpenseAmount(String(expense.amount));
    setEditingExpenseCategoryId(expense.categoryId ?? "");
    setEditingExpenseUsedTime(resolveExpenseUsedTime(expense));
  }, []);

  const cancelEditExpense = useCallback(() => {
    setEditingExpenseId(null);
  }, []);

  return createBudgetExpenseEditStateResult({
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
  });
};
