import { useBudgetMonthAndMetricsState } from "./useBudgetMonthAndMetricsState";

type UseBudgetSummaryPageStateParams = {
  navigate: (page: "budget-allowance-settings") => void;
};

/**
 * 月次サマリーページ（月に使える金額・使った金額・残り）の状態。
 * 家計簿トップページ（useBudgetPageState）とは独立した月ナビゲーションを
 * 持つ。ページ遷移でコンポーネントがアンマウントされるため、表示中の月は
 * トップページから引き継がれず「今月」から始まる
 * （budget-category-management等、他の家計簿サブページも同じ挙動）。
 */
export const useBudgetSummaryPageState = ({
  navigate,
}: UseBudgetSummaryPageStateParams) => {
  const { monthState, monthlyAllowance, metrics } =
    useBudgetMonthAndMetricsState();

  return {
    currentDate: monthState.currentDate,
    dailyBudget: metrics.dailyBudget,
    expenseCount: monthState.expenses.length,
    goToCurrentMonth: monthState.goToCurrentMonth,
    goToNextMonth: monthState.goToNextMonth,
    goToPreviousMonth: monthState.goToPreviousMonth,
    isCurrentMonth: metrics.isCurrentMonth,
    monthlyAllowance,
    navigateToAllowanceSettings: () => navigate("budget-allowance-settings"),
    remaining: metrics.remaining,
    totalExpense: metrics.totalExpense,
  };
};
