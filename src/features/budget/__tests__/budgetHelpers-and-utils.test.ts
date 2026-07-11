import {
  buildBudgetCategoryLookup,
  resolveExpenseCategory,
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
  toDateKey,
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

  it("支出からcategoryIdに対応するカテゴリを解決できる", () => {
    const categories = [
      { id: "cat-1", name: "食料品", createdAt: "2026-03-01T00:00:00.000Z" },
    ];
    const categoryLookup = buildBudgetCategoryLookup(categories);
    const expenseWithCategory = {
      id: "e1",
      date: "2026-03-03",
      amount: 100,
      categoryId: "cat-1",
      createdAt: "2026-03-03T00:00:00.000Z",
    };
    const expenseWithoutMatch = {
      id: "e2",
      date: "2026-03-05",
      amount: 200,
      categoryId: "cat-404",
      createdAt: "2026-03-05T00:00:00.000Z",
    };
    const expenseWithoutCategoryId = {
      id: "e3",
      date: "2026-03-06",
      amount: 300,
      createdAt: "2026-03-06T00:00:00.000Z",
    };

    expect(resolveExpenseCategory(categoryLookup, expenseWithCategory)).toEqual(
      categories[0],
    );
    expect(
      resolveExpenseCategory(categoryLookup, expenseWithoutMatch),
    ).toBeUndefined();
    expect(
      resolveExpenseCategory(categoryLookup, expenseWithoutCategoryId),
    ).toBeUndefined();
  });

  it("buildBudgetCategoryLookupはid毎にO(1)で引けるMapを作る", () => {
    const categories = [
      { id: "cat-1", name: "食料品", createdAt: "2026-03-01T00:00:00.000Z" },
      { id: "cat-2", name: "交通費", createdAt: "2026-03-01T00:00:00.000Z" },
    ];

    const lookup = buildBudgetCategoryLookup(categories);

    expect(lookup.get("cat-1")).toEqual(categories[0]);
    expect(lookup.get("cat-2")).toEqual(categories[1]);
    expect(lookup.get("cat-404")).toBeUndefined();
    expect(lookup.size).toBe(2);
  });

  it("日付ユーティリティを扱える", () => {
    const date = new Date("2026-03-15T00:00:00+09:00");

    expect(toMonthKey(date)).toBe("2026-03");
    expect(toDateKey(date)).toBe("2026-03-15");
    expect(shiftMonth(date, 1).getMonth()).toBe(3);
    expect(isCurrentMonthDate(new Date("2026-03-01T00:00:00+09:00"))).toBe(
      true,
    );
    expect(
      isCurrentMonthDate(
        new Date("2026-04-01T00:00:00+09:00"),
        new Date("2026-03-07T12:00:00+09:00"),
      ),
    ).toBe(false);
    expect(
      isCurrentMonthDate(
        new Date("2026-03-01T00:00:00+09:00"),
        new Date("2026-03-07T12:00:00+09:00"),
      ),
    ).toBe(true);
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
      todayExpense: 0,
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
      todayExpense: 0,
      totalExpense: 0,
    });
  });

  it("todayExpenseは今日付の支出のみを合計し、他日の支出は含めない", () => {
    expect(
      calculateBudgetMetrics(new Date("2026-03-01T00:00:00+09:00"), 31000, [
        {
          id: "e1",
          date: "2026-03-07",
          amount: 1000,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "e2",
          date: "2026-03-07",
          amount: 2000,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "e3",
          date: "2026-03-06",
          amount: 9999,
          createdAt: "2026-03-06T00:00:00.000Z",
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        todayExpense: 3000,
        totalExpense: 12999,
      }),
    );
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

    // 引数付きの new Date("2026-03-01T00:00:00+09:00")（currentDate）を除き、
    // 「現在時刻」を得るための引数なし new Date() 呼び出しはtodayKey/daysRemaining
    // を通じて1回のみであることを検証する（日付境界での不整合を防ぐため）。
    const allCalls = dateSpy.mock.calls as unknown[][];
    const nowCalls = allCalls.filter((args) => args.length === 0);
    expect(nowCalls).toHaveLength(1);

    dateSpy.mockRestore();
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
