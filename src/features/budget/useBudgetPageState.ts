import { createBudgetPageActionBindings } from "./budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "./budgetPageInputHandlers";
import { createBudgetPageStateResult } from "./budgetPageStateResult";
import { useBudgetPageActionHandlers } from "./useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "./useBudgetPageFormState";
import { useBudgetPageInitialState } from "./useBudgetPageInitialState";
import { useBudgetPageMetricsState } from "./useBudgetPageMetricsState";
import { useBudgetMonthState } from "./useBudgetMonthState";

export const useBudgetPageState = () => {
  const initialState = useBudgetPageInitialState();
  const monthState = useBudgetMonthState({ initialState });
  const {
    budgetInputValue,
    closeBudgetInput,
    closeExpenseForm,
    expenseAmount,
    expenseDescription,
    openBudgetInput,
    openExpenseForm,
    setBudgetInputValue,
    setExpenseAmount,
    setExpenseDescription,
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
        expenseDescription,
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
    setExpenseDescription,
  });

  return createBudgetPageStateResult({
    budgetInputValue,
    closeBudgetInput,
    closeExpenseForm,
    currentDate: monthState.currentDate,
    dailyBudget: metrics.dailyBudget,
    dailyRemainingBudget: metrics.dailyRemainingBudget,
    daysRemaining: metrics.daysRemaining,
    expenseAmount,
    expenseDate: monthState.expenseDate,
    expenseDescription,
    expenses: monthState.expenses,
    goToCurrentMonth: monthState.goToCurrentMonth,
    goToNextMonth: monthState.goToNextMonth,
    goToPreviousMonth: monthState.goToPreviousMonth,
    handleAddExpense,
    handleDeleteExpense,
    handleSaveBudget,
    isCurrentMonth: metrics.isCurrentMonth,
    monthBudget: monthState.monthBudget,
    openBudgetInput,
    openExpenseForm,
    remaining: metrics.remaining,
    handleBudgetInputChange: inputHandlers.handleBudgetInputChange,
    handleExpenseAmountChange: inputHandlers.handleExpenseAmountChange,
    handleExpenseDateChange: inputHandlers.handleExpenseDateChange,
    handleExpenseDescriptionChange:
      inputHandlers.handleExpenseDescriptionChange,
    showBudgetInput,
    showExpenseForm,
    totalExpense: metrics.totalExpense,
  });
};
