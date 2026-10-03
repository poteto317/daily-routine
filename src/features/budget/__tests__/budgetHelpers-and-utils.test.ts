import {
  buildBudgetCategoryLookup,
  resolveExpenseCategory,
  formatBudgetMonthLabel,
  getRemainingCardClassName,
  getRemainingTone,
  getRemainingValueClassName,
  shouldShowOverBudget,
} from "../helpers";
import {
  buildDateValue,
  clampDateToMonth,
  daysInMonth,
  daysInMonthByKey,
  formatExpenseDate,
  getDayFromDateValue,
  getDefaultExpenseDate,
  getMonthKeyFromDateValue,
  isBeforeToday,
  isCurrentMonthDate,
  monthKeyToDate,
  shiftMonthToFirstDay,
  toDateKey,
  toMonthKey,
} from "../utils/date";
import { formatCurrency } from "../utils/format";
import {
  getMonthStateSnapshot,
  parseNonNegativeAmount,
  parsePositiveAmount,
} from "../budgetPageStateHelpers";

jest.mock("../storage", () => ({
  getMonthlyExpenses: jest.fn(),
}));

import { getMonthlyExpenses } from "../storage";

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

  it("月表示を整形できる", () => {
    const date = new Date("2026-03-15T00:00:00+09:00");

    expect(formatBudgetMonthLabel(date)).toBe("2026年 3月");
  });

  it("残額表示用のトーンとクラスを返す", () => {
    expect(getRemainingTone(100)).toBe("positive");
    expect(getRemainingTone(-1)).toBe("over");
    expect(getRemainingCardClassName("positive")).toContain("bg-green-50");
    expect(getRemainingCardClassName("over")).toContain("bg-orange-50");
    expect(getRemainingValueClassName("positive")).toContain("text-green-600");
    expect(getRemainingValueClassName("over")).toContain("text-orange-600");
    expect(shouldShowOverBudget("positive")).toBe(false);
    expect(shouldShowOverBudget("over")).toBe(true);
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
    expect(shiftMonthToFirstDay(date, 1).getMonth()).toBe(3);
    expect(shiftMonthToFirstDay(date, 1).getDate()).toBe(1);
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
    expect(daysInMonthByKey("2026-03")).toBe(31);
    expect(daysInMonthByKey("2026-04")).toBe(30);
    expect(daysInMonthByKey("2026-02")).toBe(28);
    expect(daysInMonthByKey("2024-02")).toBe(29);
    expect(getDefaultExpenseDate(date)).toBe("2026-03-07");
    expect(getDefaultExpenseDate(new Date("2026-04-01T00:00:00+09:00"))).toBe(
      "2026-04-01",
    );
    expect(formatExpenseDate("2026-03-08")).toBe("3月8日");
  });

  describe("shiftMonthToFirstDayの月末日オーバーフロー回帰", () => {
    it("31日を含む月の月末日を基準にしても、前後の月がさらに1つ先に進まない", () => {
      // 3/31 の1ヶ月後を素朴に setMonth で計算すると、4月には31日が
      // 存在しないため5/1へ繰り上がってしまう（4月をスキップする）。
      // shiftMonthToFirstDay は常に1日を返すことでこれを防ぐ。
      const endOfMarch = new Date("2026-03-31T00:00:00+09:00");

      expect(toMonthKey(shiftMonthToFirstDay(endOfMarch, 1))).toBe("2026-04");
      expect(toMonthKey(shiftMonthToFirstDay(endOfMarch, -1))).toBe("2026-02");
    });

    it("7/31のように前月・翌月がどちらも31日以下の月でも正しく計算する", () => {
      const endOfJuly = new Date("2026-07-31T00:00:00+09:00");

      expect(toMonthKey(shiftMonthToFirstDay(endOfJuly, -1))).toBe("2026-06");
      expect(toMonthKey(shiftMonthToFirstDay(endOfJuly, 1))).toBe("2026-08");
    });

    it("うるう年でない年の1/31を基準に-1ヶ月しても2月をスキップしない", () => {
      const endOfJan = new Date("2026-01-31T00:00:00+09:00");

      expect(toMonthKey(shiftMonthToFirstDay(endOfJan, 1))).toBe("2026-02");
    });
  });

  it("月キーから月初日のDateを作れる", () => {
    const date = monthKeyToDate("2026-03");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(1);
  });

  it("月キーと日から日付文字列を組み立てられる", () => {
    expect(buildDateValue("2026-03", 5)).toBe("2026-03-05");
    expect(buildDateValue("2026-03", 31)).toBe("2026-03-31");
  });

  describe("日付文字列（YYYY-MM-DD）の分解とクランプ", () => {
    it("日付文字列から月キーと日を取り出せる", () => {
      expect(getMonthKeyFromDateValue("2026-03-15")).toBe("2026-03");
      expect(getDayFromDateValue("2026-03-15")).toBe(15);
    });

    it("日数が変わらない月へ移動する場合はそのまま同じ日になる", () => {
      expect(clampDateToMonth("2026-03-15", "2026-04")).toBe("2026-04-15");
    });

    it("日数が減る月へ移動する場合、選択中の日を新しい月の末日にクランプする", () => {
      expect(clampDateToMonth("2026-03-31", "2026-04")).toBe("2026-04-30");
    });

    it("うるう年でない2月へ移動する場合、28日にクランプする", () => {
      expect(clampDateToMonth("2026-01-30", "2026-02")).toBe("2026-02-28");
    });

    it("うるう年の2月へ移動する場合、29日にクランプする", () => {
      expect(clampDateToMonth("2024-01-30", "2024-02")).toBe("2024-02-29");
    });

    it("年をまたぐ月変更でも正しく計算する", () => {
      expect(clampDateToMonth("2025-12-15", "2026-01")).toBe("2026-01-15");
    });

    it("日数が増える月へ移動する場合はクランプせずそのままの日になる", () => {
      expect(clampDateToMonth("2026-04-30", "2026-05")).toBe("2026-05-30");
    });
  });

  it("金額書式を正しくフォーマットできる", () => {
    expect(formatCurrency(1234)).toBe("￥1,234");
    expect(formatCurrency(0)).toBe("￥0");
    expect(formatCurrency(1000000)).toBe("￥1,000,000");
  });

  it("月スナップショットと金額解析を取得できる", () => {
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
      expenses: [expect.objectContaining({ id: "e1", amount: 800 })],
      defaultExpenseDate: "2026-03-07",
    });
    expect(parsePositiveAmount("1200.5")).toBe(1200.5);
    expect(parsePositiveAmount("0")).toBeNull();
    expect(parsePositiveAmount("abc")).toBeNull();
  });

  it("parseNonNegativeAmount は 0 を含む 0 以上の数値だけを返す", () => {
    expect(parseNonNegativeAmount("0")).toBe(0);
    expect(parseNonNegativeAmount("1200.5")).toBe(1200.5);
    expect(parseNonNegativeAmount("-1")).toBeNull();
    expect(parseNonNegativeAmount("abc")).toBeNull();
    expect(parseNonNegativeAmount("")).toBeNull();
  });

  it("isBeforeToday は、今日（ローカル）より前の日付だけを true にする", () => {
    const now = new Date("2026-03-07T12:00:00+09:00");
    expect(isBeforeToday("2026-03-06", now)).toBe(true);
    expect(isBeforeToday("2026-02-28", now)).toBe(true);
    expect(isBeforeToday("2026-03-07", now)).toBe(false);
    expect(isBeforeToday("2026-03-08", now)).toBe(false);
    expect(isBeforeToday("2027-01-01", now)).toBe(false);
  });
});
