import type { Expense } from "@/types/routine";
import { createBudgetPageActionBindings } from "./budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "./budgetPageInputHandlers";
import { createBudgetPageStateResult } from "./budgetPageStateResult";
import { useBudgetCategoriesState } from "./useBudgetCategoriesState";
import { useBudgetExpenseEditState } from "./useBudgetExpenseEditState";
import { useBudgetPageActionHandlers } from "./useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "./useBudgetPageFormState";
import { useBudgetPageInitialState } from "./useBudgetPageInitialState";
import { useBudgetPageMetricsState } from "./useBudgetPageMetricsState";
import { useBudgetMonthState } from "./useBudgetMonthState";

type UseBudgetPageStateParams = {
  navigate: (page: "budget-category-management") => void;
};

export const useBudgetPageState = ({ navigate }: UseBudgetPageStateParams) => {
  const { categories } = useBudgetCategoriesState();
  const initialState = useBudgetPageInitialState();
  const monthState = useBudgetMonthState({ initialState });
  const {
    budgetInputValue,
    closeBudgetInput,
    closeExpenseForm,
    expenseAmount,
    expenseCategoryId,
    openBudgetInput,
    openExpenseForm,
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseCategoryId,
    showBudgetInput,
    showExpenseForm,
  } = useBudgetPageFormState({
    initialState,
    monthBudget: monthState.monthBudget,
  });
  const expenseEdit = useBudgetExpenseEditState();

  const metrics = useBudgetPageMetricsState({
    currentDate: monthState.currentDate,
    monthBudget: monthState.monthBudget,
    expenses: monthState.expenses,
  });
  const { handleAddExpense, handleUpdateExpense, handleDeleteExpense, handleSaveBudget } =
    useBudgetPageActionHandlers(
      createBudgetPageActionBindings({
        currentMonth: monthState.currentMonth,
        currentDate: monthState.currentDate,
        budgetInputValue,
        expenseAmount,
        expenseDate: monthState.expenseDate,
        expenseCategoryId,
        editingExpenseId: expenseEdit.editingExpenseId,
        editingExpenseAmount: expenseEdit.editingExpenseAmount,
        editingExpenseDate: expenseEdit.editingExpenseDate,
        editingExpenseCategoryId: expenseEdit.editingExpenseCategoryId,
        setMonthBudget: monthState.setMonthBudget,
        setExpenses: monthState.setExpenses,
        closeBudgetInput,
        closeExpenseForm,
        closeExpenseEdit: expenseEdit.cancelEditExpense,
      }),
    );
  const inputHandlers = createBudgetPageInputHandlers({
    setBudgetInputValue,
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
    budgetInputValue,
    categories,
    closeBudgetInput,
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
    handleSaveBudget,
    isCurrentMonth: metrics.isCurrentMonth,
    monthBudget: monthState.monthBudget,
    navigateToCategoryManagement: () =>
      navigate("budget-category-management"),
    openBudgetInput,
    openExpenseForm: startAddExpense,
    remaining: metrics.remaining,
    handleBudgetInputChange: inputHandlers.handleBudgetInputChange,
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
    showBudgetInput,
    showExpenseForm,
    todayExpense: metrics.todayExpense,
    totalExpense: metrics.totalExpense,
  });
};
