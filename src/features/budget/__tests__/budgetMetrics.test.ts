import type { Expense } from "@/types/routine";
import { calculateBudgetMetrics } from "../utils/metrics";

describe("calculateBudgetMetrics", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("当月の各種メトリクスを正しく組み立てる", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-05", amount: 500, createdAt: "" },
      { id: "e3", date: "2026-03-07", amount: 800, createdAt: "" },
    ];
    const currentDate = new Date("2026-03-01T00:00:00+09:00");
    const monthBudget = 31000;

    const metrics = calculateBudgetMetrics(currentDate, monthBudget, expenses);

    // 支出合計: 1000 + 500 + 800 = 2300
    // 今日の支出: 800
    // 残り予算: 31000 - 2300 = 28700
    // 1日あたり予算: 31000 / 31 = 1000
    // 未入力日数: 今日(03-07)以外の入力日は 03-01, 03-05 の2日 -> 31 - 2 = 29
    // 1日あたり使える金額: 28700 / 29
    expect(metrics).toEqual({
      dailyBudget: 1000,
      dailyRemainingBudget: 28700 / 29,
      daysRemaining: 29,
      isCurrentMonth: true,
      remaining: 28700,
      todayExpense: 800,
      totalExpense: 2300,
    });
  });

  it("当月外（翌月）の場合は daysRemaining と dailyRemainingBudget を 0 にする", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-04-01", amount: 1200, createdAt: "" },
    ];
    const futureDate = new Date("2026-04-01T00:00:00+09:00");
    const monthBudget = 30000;

    const metrics = calculateBudgetMetrics(futureDate, monthBudget, expenses);

    expect(metrics).toEqual({
      dailyBudget: 1000,
      dailyRemainingBudget: 0,
      daysRemaining: 0,
      isCurrentMonth: false,
      remaining: 28800,
      todayExpense: 0,
      totalExpense: 1200,
    });
  });

  it("monthBudget が 0 の場合は dailyBudget と dailyRemainingBudget を 0 にする", () => {
    const currentDate = new Date("2026-03-01T00:00:00+09:00");
    const metrics = calculateBudgetMetrics(currentDate, 0, []);

    expect(metrics.dailyBudget).toBe(0);
    expect(metrics.dailyRemainingBudget).toBe(0);
    expect(metrics.remaining).toBe(0);
  });

  it("todayKeyとdaysRemainingの算出で同一のnowを共有し、Dateを複数回生成しない", () => {
    const RealDate = global.Date;
    const dateSpy = jest
      .spyOn(global, "Date")
      .mockImplementation(
        (...args: unknown[]) =>
          new (RealDate as new (...args: unknown[]) => Date)(...args),
      );

    calculateBudgetMetrics(new RealDate("2026-03-01T00:00:00+09:00"), 31000, [
      {
        id: "e1",
        date: "2026-03-07",
        amount: 1000,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ]);

    const allCalls = dateSpy.mock.calls as unknown[][];
    const nowCalls = allCalls.filter((args) => args.length === 0);
    expect(nowCalls).toHaveLength(1);

    dateSpy.mockRestore();
  });

  it("支出合計が予算を超過した場合（予算オーバー）、dailyRemainingBudget は負の値を返し NaN にならない", () => {
    const currentDate = new Date("2026-03-01T00:00:00+09:00");
    const monthBudget = 10000;
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 15000, createdAt: "" },
    ];

    const metrics = calculateBudgetMetrics(currentDate, monthBudget, expenses);

    // 残り予算: 10000 - 15000 = -5000
    // 未入力日数: 31 - 1 = 30
    // 1日あたり: -5000 / 30
    expect(metrics.remaining).toBe(-5000);
    expect(metrics.dailyRemainingBudget).toBe(-5000 / 30);
    expect(Number.isNaN(metrics.dailyRemainingBudget)).toBe(false);
  });

  it("明示的に now 引数を渡した場合、その日時基準でメトリクスが算出される", () => {
    const currentDate = new Date("2026-04-01T00:00:00+09:00");
    const customNow = new Date("2026-04-15T10:00:00+09:00");
    const monthBudget = 30000;
    const expenses: Expense[] = [
      { id: "e1", date: "2026-04-01", amount: 3000, createdAt: "" },
      { id: "e2", date: "2026-04-15", amount: 1000, createdAt: "" },
    ];

    const metrics = calculateBudgetMetrics(
      currentDate,
      monthBudget,
      expenses,
      customNow,
    );

    // 4月は30日
    // 今日(04-15)以外に入力がある日: 04-01 の1日
    // 未入力日数: 30 - 1 = 29
    // 残り予算: 30000 - 4000 = 26000
    expect(metrics.isCurrentMonth).toBe(true);
    expect(metrics.todayExpense).toBe(1000);
    expect(metrics.totalExpense).toBe(4000);
    expect(metrics.daysRemaining).toBe(29);
    expect(metrics.dailyRemainingBudget).toBe(26000 / 29);
  });
});
