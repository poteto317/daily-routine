import { useState } from "react";
import type { Expense } from "@/types/routine";
import { createBudgetPageActionBindings } from "./budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "./budgetPageInputHandlers";
import { createBudgetPageStateResult } from "./budgetPageStateResult";
import { useBudgetCategoriesState } from "./useBudgetCategoriesState";
import { useBudgetExpenseEditState } from "./useBudgetExpenseEditState";
import { useBudgetMissingExpenseDates } from "./useBudgetMissingExpenseDates";
import { useBudgetMonthAndMetricsState } from "./useBudgetMonthAndMetricsState";
import { useBudgetPageActionHandlers } from "./useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "./useBudgetPageFormState";
import { getDefaultExpenseDate } from "./utils/date";

type UseBudgetPageStateParams = {
  navigate: (page: "budget-category-management" | "budget-summary") => void;
};

export const useBudgetPageState = ({ navigate }: UseBudgetPageStateParams) => {
  const { categories } = useBudgetCategoriesState();
  const { initialState, monthState, metrics } = useBudgetMonthAndMetricsState();
  const {
    closeExpenseForm,
    expenseAmount,
    expenseCategoryId,
    openExpenseForm,
    setExpenseAmount,
    setExpenseCategoryId,
    showExpenseForm,
  } = useBudgetPageFormState({ initialState });
  const expenseEdit = useBudgetExpenseEditState();
  // フォームを開く操作（日付のボタン・「➕」）の回数。フォームのスクロールの合図
  const [formOpenRequest, setFormOpenRequest] = useState(0);
  const missingExpenseDates = useBudgetMissingExpenseDates({
    currentDate: monthState.currentDate,
    expenses: monthState.expenses,
  });

  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense } =
    useBudgetPageActionHandlers(
      createBudgetPageActionBindings({
        currentMonth: monthState.currentMonth,
        currentDate: monthState.currentDate,
        expenseAmount,
        expenseDate: monthState.expenseDate,
        expenseCategoryId,
        editingExpenseId: expenseEdit.editingExpenseId,
        editingExpenseAmount: expenseEdit.editingExpenseAmount,
        editingExpenseDate: expenseEdit.editingExpenseDate,
        editingExpenseCategoryId: expenseEdit.editingExpenseCategoryId,
        setExpenses: monthState.setExpenses,
        closeExpenseForm,
        closeExpenseEdit: expenseEdit.cancelEditExpense,
      }),
    );
  const inputHandlers = createBudgetPageInputHandlers({
    setExpenseAmount,
    setExpenseDate: monthState.setExpenseDate,
    setExpenseCategoryId,
    setEditingExpenseAmount: expenseEdit.setEditingExpenseAmount,
    setEditingExpenseDate: expenseEdit.setEditingExpenseDate,
    setEditingExpenseCategoryId: expenseEdit.setEditingExpenseCategoryId,
  });

  // 追加フォームと編集フォームの同時表示による入力状態の混在を避けるため、
  // どちらか一方を開始したらもう一方を閉じる（双方向）
  const startEditExpense = (expense: Expense) => {
    closeExpenseForm();
    expenseEdit.startEditExpense(expense);
  };
  const startAddExpense = () => {
    expenseEdit.cancelEditExpense();
    openExpenseForm();
  };
  // 「➕」は直前の日付を引き継がず既定の日付へ戻す。今日はハンドラ内で取る（描画時だと固定される）
  const startAddExpenseOnDefaultDate = () => {
    monthState.setExpenseDate(getDefaultExpenseDate(monthState.currentDate));
    startAddExpense();
    setFormOpenRequest((n) => n + 1);
  };
  // 未入力の日のボタンから、その日付で開く。入力中の金額・カテゴリは残す
  const startAddExpenseOnDate = (date: string) => {
    monthState.setExpenseDate(date);
    startAddExpense();
    setFormOpenRequest((n) => n + 1);
  };

  return createBudgetPageStateResult({
    categories,
    closeExpenseForm,
    currentDate: monthState.currentDate,
    dailyRemainingBudget: metrics.dailyRemainingBudget,
    editingExpenseId: expenseEdit.editingExpenseId,
    editingExpenseAmount: expenseEdit.editingExpenseAmount,
    editingExpenseDate: expenseEdit.editingExpenseDate,
    editingExpenseCategoryId: expenseEdit.editingExpenseCategoryId,
    expenseAmount,
    expenseDate: monthState.expenseDate,
    expenseCategoryId,
    expenses: monthState.expenses,
    formOpenRequest,
    goToCurrentMonth: monthState.goToCurrentMonth,
    goToNextMonth: monthState.goToNextMonth,
    goToPreviousMonth: monthState.goToPreviousMonth,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    isCurrentMonth: metrics.isCurrentMonth,
    missingExpenseDates,
    navigateToCategoryManagement: () => navigate("budget-category-management"),
    navigateToSummary: () => navigate("budget-summary"),
    openExpenseForm: startAddExpenseOnDefaultDate,
    handleExpenseAmountChange: inputHandlers.handleExpenseAmountChange,
    handleExpenseDateChange: inputHandlers.handleExpenseDateChange,
    handleExpenseCategoryIdChange: inputHandlers.handleExpenseCategoryIdChange,
    handleEditExpenseAmountChange: inputHandlers.handleEditExpenseAmountChange,
    handleEditExpenseDateChange: inputHandlers.handleEditExpenseDateChange,
    handleEditExpenseCategoryIdChange:
      inputHandlers.handleEditExpenseCategoryIdChange,
    startAddExpenseOnDate,
    startEditExpense,
    cancelEditExpense: expenseEdit.cancelEditExpense,
    showExpenseForm,
    todayExpense: metrics.todayExpense,
  });
};
