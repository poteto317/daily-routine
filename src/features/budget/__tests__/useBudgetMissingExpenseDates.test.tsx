import { renderHook } from "@testing-library/react";
import type { Expense } from "@/types/routine";
import { useBudgetMissingExpenseDates } from "../useBudgetMissingExpenseDates";

const marchExpenses: Expense[] = [
  {
    id: "e1",
    date: "2026-03-03",
    amount: 1000,
    createdAt: "2026-03-03T00:00:00.000Z",
  },
];

describe("useBudgetMissingExpenseDates", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("今月を表示しているとき、1 日〜昨日のうち記録の無い日を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

    const { result } = renderHook(() =>
      useBudgetMissingExpenseDates({
        currentDate: new Date("2026-03-01T00:00:00+09:00"),
        expenses: marchExpenses,
      }),
    );

    expect(result.current).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
    ]);
  });

  it("前月・次月を表示しているときは [] を返す（前月に記録の無い日があっても）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

    const { result: previous } = renderHook(() =>
      useBudgetMissingExpenseDates({
        currentDate: new Date("2026-02-01T00:00:00+09:00"),
        expenses: [],
      }),
    );
    const { result: next } = renderHook(() =>
      useBudgetMissingExpenseDates({
        currentDate: new Date("2026-04-01T00:00:00+09:00"),
        expenses: [],
      }),
    );

    expect(previous.current).toEqual([]);
    expect(next.current).toEqual([]);
  });

  it("同じ入力で再描画しても、同じ配列（参照）を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-01T00:00:00+09:00"),
      expenses: marchExpenses,
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    const first = result.current;
    rerender(props);

    expect(result.current).toBe(first);
  });

  it("今月以外を表示しているとき、再描画しても同じ [] の参照を返す（毎回新しい配列を作らない）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
    const props = {
      currentDate: new Date("2026-02-01T00:00:00+09:00"),
      expenses: [] as Expense[],
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    const first = result.current;
    rerender(props);

    expect(first).toEqual([]);
    expect(result.current).toBe(first);
  });

  it("同じ月・同じ時刻のまま expenses が変わった再描画で、結果が更新される", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
    const currentDate = new Date("2026-03-01T00:00:00+09:00");

    const { result, rerender } = renderHook(
      (hookProps: { currentDate: Date; expenses: Expense[] }) =>
        useBudgetMissingExpenseDates(hookProps),
      { initialProps: { currentDate, expenses: [] as Expense[] } },
    );
    expect(result.current).toContain("2026-03-03");
    expect(result.current).toContain("2026-03-04");

    rerender({
      currentDate,
      expenses: [
        {
          id: "e3",
          date: "2026-03-03",
          amount: 500,
          createdAt: "2026-03-03T00:00:00.000Z",
        },
      ],
    });

    expect(result.current).not.toContain("2026-03-03");
    expect(result.current).toContain("2026-03-04");
  });

  it("日付をまたいだ後の再描画で、前日が加わる（描画時の今日を持ち続けない）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-01T00:00:00+09:00"),
      expenses: marchExpenses,
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    expect(result.current).not.toContain("2026-03-07");

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender(props);

    expect(result.current).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
    ]);
  });

  it("月をまたいだ後の再描画で、表示中の月がもう今月でなければ [] になる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-31T23:59:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-01T00:00:00+09:00"),
      expenses: marchExpenses,
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    expect(result.current).toHaveLength(29);

    jest.setSystemTime(new Date("2026-04-01T00:01:00+09:00"));
    rerender(props);

    expect(result.current).toEqual([]);
  });
});
