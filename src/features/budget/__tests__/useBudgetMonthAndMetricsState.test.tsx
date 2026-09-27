import { renderHook } from "@testing-library/react";

jest.mock("../useBudgetAllowanceState", () => ({
  useBudgetAllowanceState: jest.fn(),
}));

jest.mock("../useBudgetMonthState", () => ({
  useBudgetMonthState: jest.fn(),
}));

jest.mock("../useBudgetPageInitialState", () => ({
  useBudgetPageInitialState: jest.fn(),
}));

jest.mock("../useBudgetPageMetricsState", () => ({
  useBudgetPageMetricsState: jest.fn(),
}));

import { useBudgetAllowanceState } from "../useBudgetAllowanceState";
import { useBudgetMonthState } from "../useBudgetMonthState";
import { useBudgetPageInitialState } from "../useBudgetPageInitialState";
import { useBudgetPageMetricsState } from "../useBudgetPageMetricsState";
import { useBudgetMonthAndMetricsState } from "../useBudgetMonthAndMetricsState";

const monthlyAllowance = {
  totalIncome: 300000,
  totalFixed: 80000,
  totalVariable: 30000,
  totalExpenseItems: 110000,
  allowance: 190000,
};

const initialState = {
  expenseAmount: "",
  expenseCategoryId: "",
  showExpenseForm: false,
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

const metrics = {
  dailyBudget: 6333,
  dailyRemainingBudget: 5000,
  isCurrentMonth: true,
  remaining: 188800,
  todayExpense: 400,
  totalExpense: 1200,
  unenteredDays: 24,
};

describe("useBudgetMonthAndMetricsState", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useBudgetPageInitialState as jest.Mock).mockReturnValue(initialState);
    (useBudgetMonthState as jest.Mock).mockReturnValue(monthState);
    (useBudgetAllowanceState as jest.Mock).mockReturnValue({
      monthlyAllowance,
    });
    (useBudgetPageMetricsState as jest.Mock).mockReturnValue(metrics);
  });

  it("initialState を useBudgetMonthState へ渡す", () => {
    renderHook(() => useBudgetMonthAndMetricsState());

    expect(useBudgetMonthState).toHaveBeenCalledWith({ initialState });
  });

  it("monthState.currentDate/expenses と monthlyAllowance.allowance を useBudgetPageMetricsState へ渡す", () => {
    renderHook(() => useBudgetMonthAndMetricsState());

    expect(useBudgetPageMetricsState).toHaveBeenCalledWith({
      currentDate: monthState.currentDate,
      monthBudget: monthlyAllowance.allowance,
      expenses: monthState.expenses,
    });
  });

  it("initialState/monthState/monthlyAllowance/metrics をまとめて返す", () => {
    const { result } = renderHook(() => useBudgetMonthAndMetricsState());

    expect(result.current).toEqual({
      initialState,
      monthState,
      monthlyAllowance,
      metrics,
    });
  });
});
