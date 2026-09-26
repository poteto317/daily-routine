import type { Expense } from "@/types/routine";
import { createBudgetPageActionBindings } from "./budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "./budgetPageInputHandlers";
import { createBudgetPageStateResult } from "./budgetPageStateResult";
import { useBudgetCategoriesState } from "./useBudgetCategoriesState";
import { useBudgetExpenseEditState } from "./useBudgetExpenseEditState";
import { useBudgetMonthAndMetricsState } from "./useBudgetMonthAndMetricsState";
import { useBudgetPageActionHandlers } from "./useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "./useBudgetPageFormState";

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
        editingExpenseUsedTime: expenseEdit.editingExpenseUsedTime,
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
    setEditingExpenseUsedTime: expenseEdit.setEditingExpenseUsedTime,
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
    dailyRemainingBudget: metrics.dailyRemainingBudget,
    editingExpenseId: expenseEdit.editingExpenseId,
    editingExpenseAmount: expenseEdit.editingExpenseAmount,
    editingExpenseDate: expenseEdit.editingExpenseDate,
    editingExpenseCategoryId: expenseEdit.editingExpenseCategoryId,
    editingExpenseUsedTime: expenseEdit.editingExpenseUsedTime,
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
    navigateToCategoryManagement: () => navigate("budget-category-management"),
    navigateToSummary: () => navigate("budget-summary"),
    openExpenseForm: startAddExpense,
    handleExpenseAmountChange: inputHandlers.handleExpenseAmountChange,
    handleExpenseDateChange: inputHandlers.handleExpenseDateChange,
    handleExpenseCategoryIdChange: inputHandlers.handleExpenseCategoryIdChange,
    handleEditExpenseAmountChange: inputHandlers.handleEditExpenseAmountChange,
    handleEditExpenseDateChange: inputHandlers.handleEditExpenseDateChange,
    handleEditExpenseCategoryIdChange:
      inputHandlers.handleEditExpenseCategoryIdChange,
    handleEditExpenseUsedTimeChange:
      inputHandlers.handleEditExpenseUsedTimeChange,
    startEditExpense,
    cancelEditExpense: expenseEdit.cancelEditExpense,
    showExpenseForm,
    todayExpense: metrics.todayExpense,
  });
};
