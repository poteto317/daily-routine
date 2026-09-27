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

    // 31日の月で、今日（03-07）以外に入力がある日は2日（03-01, 03-05）
    // unenteredDays = 31 - 2 = 29
    expect(result.current).toEqual({
      dailyBudget: 1000,
      dailyRemainingBudget: 29500 / 29,
      isCurrentMonth: true,
      remaining: 29500,
      todayExpense: 0,
      totalExpense: 1500,
      unenteredDays: 29,
    });
  });

  it("non current month では unenteredDays と dailyRemainingBudget を 0 にする", () => {
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
      isCurrentMonth: false,
      remaining: 28800,
      todayExpense: 0,
      totalExpense: 1200,
      unenteredDays: 0,
    });
  });

  it("今日付の支出があっても今日が日数に含まれ、todayExpense に反映する", () => {
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

    // 今日（03-07）に入力があっても例外として日数に含めるため、今日以外の入力日（03-01）の1日のみ引かれる: 31 - 1 = 30
    expect(result.current.todayExpense).toBe(800);
    expect(result.current.totalExpense).toBe(1800);
    expect(result.current.unenteredDays).toBe(30);
    expect(result.current.dailyRemainingBudget).toBe((31000 - 1800) / 30);
  });
});
