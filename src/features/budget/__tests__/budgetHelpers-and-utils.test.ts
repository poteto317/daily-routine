import {
  formatBudgetMonthLabel,
  getBudgetActionLabel,
  getBudgetExpenseDateBounds,
  getRemainingCardClassName,
  getRemainingTone,
  getRemainingValueClassName,
  shouldShowOverBudget,
  sortExpensesByDateDesc,
} from "../helpers";
import {
  daysInMonth,
  formatExpenseDate,
  getDefaultExpenseDate,
  isCurrentMonthDate,
  shiftMonth,
  toMonthKey,
} from "../utils/date";
import { formatCurrency } from "../utils/format";
import { calculateBudgetMetrics } from "../utils/metrics";
import {
  getMonthStateSnapshot,
  parsePositiveAmount,
} from "../budgetPageStateHelpers";

jest.mock("../storage", () => ({
  getMonthlyBudget: jest.fn(),
  getMonthlyExpenses: jest.fn(),
}));

import { getMonthlyBudget, getMonthlyExpenses } from "../storage";

const mockGetMonthlyBudget = getMonthlyBudget as jest.MockedFunction<
  typeof getMonthlyBudget
>;
const mockGetMonthlyExpenses = getMonthlyExpenses as jest.MockedFunction<
  typeof getMonthlyExpenses
>;

describe("budget helpers and utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("月表示と日付境界を整形できる", () => {
    const date = new Date("2026-03-15T00:00:00+09:00");

    expect(formatBudgetMonthLabel(date)).toBe("2026年 3月");
    expect(getBudgetExpenseDateBounds(date)).toEqual({
      minDate: "2026-03-01",
      maxDate: "2026-03-31",
    });
  });

  it("残額表示用のトーンとクラスを返す", () => {
    expect(getBudgetActionLabel(1000)).toBe("変更");
    expect(getBudgetActionLabel(0)).toBe("設定");
    expect(getRemainingTone(100)).toBe("positive");
    expect(getRemainingTone(-1)).toBe("over");
    expect(getRemainingCardClassName("positive")).toContain("bg-green-50");
    expect(getRemainingCardClassName("over")).toContain("bg-orange-50");
    expect(getRemainingValueClassName("positive")).toContain("text-green-600");
    expect(getRemainingValueClassName("over")).toContain("text-orange-600");
    expect(shouldShowOverBudget("positive")).toBe(false);
    expect(shouldShowOverBudget("over")).toBe(true);
  });

  it("支出一覧を日付降順に並べる", () => {
    expect(
      sortExpensesByDateDesc([
        {
          id: "e1",
          date: "2026-03-03",
          amount: 100,
          createdAt: "2026-03-03T00:00:00.000Z",
        },
        {
          id: "e2",
          date: "2026-03-05",
          amount: 200,
          createdAt: "2026-03-05T00:00:00.000Z",
        },
      ]),
    ).toEqual([
      expect.objectContaining({ id: "e2" }),
      expect.objectContaining({ id: "e1" }),
    ]);
  });

  it("日付ユーティリティを扱える", () => {
    const date = new Date("2026-03-15T00:00:00+09:00");

    expect(toMonthKey(date)).toBe("2026-03");
    expect(shiftMonth(date, 1).getMonth()).toBe(3);
    expect(isCurrentMonthDate(new Date("2026-03-01T00:00:00+09:00"))).toBe(
      true,
    );
    expect(daysInMonth(date)).toBe(31);
    expect(getDefaultExpenseDate(date)).toBe("2026-03-07");
    expect(getDefaultExpenseDate(new Date("2026-04-01T00:00:00+09:00"))).toBe(
      "2026-04-01",
    );
    expect(formatExpenseDate("2026-03-08")).toBe("3月8日");
  });

  it("金額書式とメトリクスを計算できる", () => {
    expect(formatCurrency(1234)).toBe("￥1,234");
    expect(
      calculateBudgetMetrics(new Date("2026-03-01T00:00:00+09:00"), 31000, [
        {
          id: "e1",
          date: "2026-03-02",
          amount: 5000,
          createdAt: "2026-03-02T00:00:00.000Z",
        },
      ]),
    ).toEqual({
      dailyBudget: 1000,
      dailyRemainingBudget: 1040,
      daysRemaining: 25,
      isCurrentMonth: true,
      remaining: 26000,
      totalExpense: 5000,
    });
    expect(
      calculateBudgetMetrics(new Date("2026-04-01T00:00:00+09:00"), 0, []),
    ).toEqual({
      dailyBudget: 0,
      dailyRemainingBudget: 0,
      daysRemaining: 0,
      isCurrentMonth: false,
      remaining: 0,
      totalExpense: 0,
    });
  });

  it("月スナップショットと金額解析を取得できる", () => {
    mockGetMonthlyBudget.mockReturnValue({ totalAmount: 42000 } as never);
    mockGetMonthlyExpenses.mockReturnValue([
      {
        id: "e1",
        date: "2026-03-06",
        amount: 800,
        createdAt: "2026-03-06T00:00:00.000Z",
      },
    ] as never);

    expect(
      getMonthStateSnapshot(new Date("2026-03-03T00:00:00+09:00")),
    ).toEqual({
      monthKey: "2026-03",
      monthBudget: 42000,
      expenses: [expect.objectContaining({ id: "e1", amount: 800 })],
      defaultExpenseDate: "2026-03-07",
    });
    expect(parsePositiveAmount("1200.5")).toBe(1200.5);
    expect(parsePositiveAmount("0")).toBeNull();
    expect(parsePositiveAmount("abc")).toBeNull();
  });
});
