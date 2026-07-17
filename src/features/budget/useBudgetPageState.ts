import type { Expense } from "@/types/routine";
import { createBudgetPageActionBindings } from "./budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "./budgetPageInputHandlers";
import { createBudgetPageStateResult } from "./budgetPageStateResult";
import { useBudgetAllowanceState } from "./useBudgetAllowanceState";
import { useBudgetCategoriesState } from "./useBudgetCategoriesState";
import { useBudgetExpenseEditState } from "./useBudgetExpenseEditState";
import { useBudgetPageActionHandlers } from "./useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "./useBudgetPageFormState";
import { useBudgetPageInitialState } from "./useBudgetPageInitialState";
import { useBudgetPageMetricsState } from "./useBudgetPageMetricsState";
import { useBudgetMonthState } from "./useBudgetMonthState";

type UseBudgetPageStateParams = {
  navigate: (
    page: "budget-category-management" | "budget-allowance-settings",
  ) => void;
};

export const useBudgetPageState = ({ navigate }: UseBudgetPageStateParams) => {
  const { categories } = useBudgetCategoriesState();
  const { monthlyAllowance } = useBudgetAllowanceState();
  const initialState = useBudgetPageInitialState();
  const monthState = useBudgetMonthState({ initialState });
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

  const metrics = useBudgetPageMetricsState({
    currentDate: monthState.currentDate,
    monthBudget: monthlyAllowance.allowance,
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

  return createBudgetPageStateResult({
    categories,
    closeExpenseForm,
    currentDate: monthState.currentDate,
    dailyBudget: metrics.dailyBudget,
    dailyRemainingBudget: metrics.dailyRemainingBudget,
    daysRemaining: metrics.daysRemaining,
    editingExpenseId: expenseEdit.editingExpenseId,
    editingExpenseAmount: expenseEdit.editingExpenseAmount,
    editingExpenseDate: expenseEdit.editingExpenseDate,
    editingExpenseCategoryId: expenseEdit.editingExpenseCategoryId,
    expenseAmount,
    expenseDate: monthState.expenseDate,
    expenseCategoryId,
    expenses: monthState.expenses,
    goToCurrentMonth: monthState.goToCurrentMonth,
    goToNextMonth: monthState.goToNextMonth,
    goToPreviousMonth: monthState.goToPreviousMonth,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    isCurrentMonth: metrics.isCurrentMonth,
    monthBudget: monthlyAllowance.allowance,
    monthlyAllowance,
    navigateToCategoryManagement: () =>
      navigate("budget-category-management"),
    navigateToAllowanceSettings: () => navigate("budget-allowance-settings"),
    openExpenseForm: startAddExpense,
    remaining: metrics.remaining,
    handleExpenseAmountChange: inputHandlers.handleExpenseAmountChange,
    handleExpenseDateChange: inputHandlers.handleExpenseDateChange,
    handleExpenseCategoryIdChange:
      inputHandlers.handleExpenseCategoryIdChange,
    handleEditExpenseAmountChange:
      inputHandlers.handleEditExpenseAmountChange,
    handleEditExpenseDateChange: inputHandlers.handleEditExpenseDateChange,
    handleEditExpenseCategoryIdChange:
      inputHandlers.handleEditExpenseCategoryIdChange,
    startEditExpense,
    cancelEditExpense: expenseEdit.cancelEditExpense,
    showExpenseForm,
    todayExpense: metrics.todayExpense,
    totalExpense: metrics.totalExpense,
  });
};
