import { createBudgetPageActionBindings } from "./budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "./budgetPageInputHandlers";
import { createBudgetPageStateResult } from "./budgetPageStateResult";
import { useBudgetCategoriesState } from "./useBudgetCategoriesState";
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

  const metrics = useBudgetPageMetricsState({
    currentDate: monthState.currentDate,
    monthBudget: monthState.monthBudget,
    expenses: monthState.expenses,
  });
  const { handleAddExpense, handleDeleteExpense, handleSaveBudget } =
    useBudgetPageActionHandlers(
      createBudgetPageActionBindings({
        currentMonth: monthState.currentMonth,
        currentDate: monthState.currentDate,
        budgetInputValue,
        expenseAmount,
        expenseDate: monthState.expenseDate,
        expenseCategoryId,
        setMonthBudget: monthState.setMonthBudget,
        setExpenses: monthState.setExpenses,
        closeBudgetInput,
        closeExpenseForm,
      }),
    );
  const inputHandlers = createBudgetPageInputHandlers({
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseDate: monthState.setExpenseDate,
    setExpenseCategoryId,
  });

  return createBudgetPageStateResult({
    budgetInputValue,
    categories,
    closeBudgetInput,
    closeExpenseForm,
    currentDate: monthState.currentDate,
    dailyBudget: metrics.dailyBudget,
    dailyRemainingBudget: metrics.dailyRemainingBudget,
    daysRemaining: metrics.daysRemaining,
    expenseAmount,
    expenseDate: monthState.expenseDate,
    expenseCategoryId,
    expenses: monthState.expenses,
    goToCurrentMonth: monthState.goToCurrentMonth,
    goToNextMonth: monthState.goToNextMonth,
    goToPreviousMonth: monthState.goToPreviousMonth,
    handleAddExpense,
    handleDeleteExpense,
    handleSaveBudget,
    isCurrentMonth: metrics.isCurrentMonth,
    monthBudget: monthState.monthBudget,
    navigateToCategoryManagement: () =>
      navigate("budget-category-management"),
    openBudgetInput,
    openExpenseForm,
    remaining: metrics.remaining,
    handleBudgetInputChange: inputHandlers.handleBudgetInputChange,
    handleExpenseAmountChange: inputHandlers.handleExpenseAmountChange,
    handleExpenseDateChange: inputHandlers.handleExpenseDateChange,
    handleExpenseCategoryIdChange:
      inputHandlers.handleExpenseCategoryIdChange,
    showBudgetInput,
    showExpenseForm,
    totalExpense: metrics.totalExpense,
  });
};
