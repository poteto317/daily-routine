import { renderHook } from "@testing-library/react";

jest.mock("../useBudgetMonthAndMetricsState", () => ({
  useBudgetMonthAndMetricsState: jest.fn(),
}));

import { useBudgetMonthAndMetricsState } from "../useBudgetMonthAndMetricsState";
import { useBudgetSummaryPageState } from "../useBudgetSummaryPageState";

const monthlyAllowance = {
  totalIncome: 300000,
  totalFixed: 80000,
  totalVariable: 30000,
  totalExpenseItems: 110000,
  allowance: 190000,
};

const monthState = {
  currentDate: new Date("2026-03-07T00:00:00.000Z"),
  currentMonth: "2026-03",
  expenseDate: "2026-03-07",
  expenses: [
    {
      id: "e1",
      date: "2026-03-06",
      amount: 1200,
      createdAt: "2026-03-06T00:00:00.000Z",
    },
  ],
  goToCurrentMonth: jest.fn(),
  goToNextMonth: jest.fn(),
  goToPreviousMonth: jest.fn(),
  setExpenseDate: jest.fn(),
  setExpenses: jest.fn(),
};

describe("useBudgetSummaryPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useBudgetMonthAndMetricsState as jest.Mock).mockReturnValue({
      initialState: {
        expenseAmount: "",
        expenseCategoryId: "",
        showExpenseForm: false,
      },
      monthState,
      monthlyAllowance,
      metrics: {
        dailyBudget: 6333,
        dailyRemainingBudget: 5000,
        daysRemaining: 24,
        isCurrentMonth: true,
        remaining: 188800,
        todayExpense: 400,
        totalExpense: 1200,
      },
    });
  });

  it("useBudgetMonthAndMetricsStateの結果をまとめて返す", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() =>
      useBudgetSummaryPageState({ navigate }),
    );

    expect(useBudgetMonthAndMetricsState).toHaveBeenCalledTimes(1);

    expect(result.current.currentDate).toEqual(monthState.currentDate);
    expect(result.current.dailyBudget).toBe(6333);
    expect(result.current.expenseCount).toBe(1);
    expect(result.current.isCurrentMonth).toBe(true);
    expect(result.current.monthlyAllowance).toEqual(monthlyAllowance);
    expect(result.current.remaining).toBe(188800);
    expect(result.current.totalExpense).toBe(1200);
    // monthBudgetは公開しない。表示側はmonthlyAllowance.allowanceから導出する
    // （同じ値を別々のフィールドで二重に持たない）。
    expect(result.current).not.toHaveProperty("monthBudget");
  });

  it("goToCurrentMonth/goToNextMonth/goToPreviousMonthはmonthStateのものをそのまま返す", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() =>
      useBudgetSummaryPageState({ navigate }),
    );

    expect(result.current.goToCurrentMonth).toBe(monthState.goToCurrentMonth);
    expect(result.current.goToNextMonth).toBe(monthState.goToNextMonth);
    expect(result.current.goToPreviousMonth).toBe(
      monthState.goToPreviousMonth,
    );
  });

  it("navigateToAllowanceSettingsはbudget-allowance-settingsへ遷移する", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() =>
      useBudgetSummaryPageState({ navigate }),
    );

    result.current.navigateToAllowanceSettings();

    expect(navigate).toHaveBeenCalledWith("budget-allowance-settings");
  });
});
