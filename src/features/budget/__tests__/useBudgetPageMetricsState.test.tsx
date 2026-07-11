import { renderHook } from "@testing-library/react";
import { useBudgetPageMetricsState } from "../useBudgetPageMetricsState";

describe("useBudgetPageMetricsState", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("current month の budget metrics を返す", () => {
    const { result } = renderHook(() =>
      useBudgetPageMetricsState({
        currentDate: new Date("2026-03-07T00:00:00+09:00"),
        monthBudget: 31000,
        expenses: [
          {
            id: "expense-1",
            date: "2026-03-01",
            amount: 1000,
            createdAt: "2026-03-01T00:00:00.000Z",
          },
          {
            id: "expense-2",
            date: "2026-03-05",
            amount: 500,
            createdAt: "2026-03-05T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(result.current).toEqual({
      dailyBudget: 1000,
      dailyRemainingBudget: 29500 / 25,
      daysRemaining: 25,
      isCurrentMonth: true,
      remaining: 29500,
      todayExpense: 0,
      totalExpense: 1500,
    });
  });

  it("non current month では daysRemaining と dailyRemainingBudget を 0 にする", () => {
    const { result } = renderHook(() =>
      useBudgetPageMetricsState({
        currentDate: new Date("2026-04-01T00:00:00+09:00"),
        monthBudget: 30000,
        expenses: [
          {
            id: "expense-1",
            date: "2026-04-01",
            amount: 1200,
            createdAt: "2026-04-01T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(result.current).toEqual({
      dailyBudget: 1000,
      dailyRemainingBudget: 0,
      daysRemaining: 0,
      isCurrentMonth: false,
      remaining: 28800,
      todayExpense: 0,
      totalExpense: 1200,
    });
  });

  it("今日付の支出があるとき todayExpense に反映する", () => {
    const { result } = renderHook(() =>
      useBudgetPageMetricsState({
        currentDate: new Date("2026-03-07T00:00:00+09:00"),
        monthBudget: 31000,
        expenses: [
          {
            id: "expense-1",
            date: "2026-03-01",
            amount: 1000,
            createdAt: "2026-03-01T00:00:00.000Z",
          },
          {
            id: "expense-2",
            date: "2026-03-07",
            amount: 800,
            createdAt: "2026-03-07T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(result.current.todayExpense).toBe(800);
    expect(result.current.totalExpense).toBe(1800);
  });
});
