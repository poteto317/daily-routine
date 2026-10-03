import { buildExpensePayload } from "../budgetPageStateLogic";

describe("budgetPageStateLogic", () => {
  it("有効な支出入力からpayloadを作る", () => {
    expect(
      buildExpensePayload({
        expenseAmount: "1500",
        expenseDate: "2026-03-07",
        expenseCategoryId: "category-lunch",
      }),
    ).toEqual({
      amount: 1500,
      date: "2026-03-07",
      categoryId: "category-lunch",
    });
  });

  it("カテゴリ未選択の場合は categoryId が undefined になる", () => {
    expect(
      buildExpensePayload({
        expenseAmount: "1500",
        expenseDate: "2026-03-07",
        expenseCategoryId: "",
      }),
    ).toEqual({
      amount: 1500,
      date: "2026-03-07",
      categoryId: undefined,
    });
  });

  it("無効な支出入力ではnullを返す", () => {
    expect(
      buildExpensePayload({
        expenseAmount: "",
        expenseDate: "2026-03-07",
        expenseCategoryId: "",
      }),
    ).toBeNull();
    expect(
      buildExpensePayload({
        expenseAmount: "1500",
        expenseDate: "",
        expenseCategoryId: "",
      }),
    ).toBeNull();
  });

  describe("0 円の支出（今日より前の日付のみ）", () => {
    const now = new Date("2026-03-07T12:00:00+09:00");
    const build = (expenseAmount: string, expenseDate: string) =>
      buildExpensePayload({
        expenseAmount,
        expenseDate,
        expenseCategoryId: "",
        now,
      });

    it("今日より前の日付なら、0 円の payload を作る", () => {
      expect(build("0", "2026-03-06")).toEqual({
        amount: 0,
        date: "2026-03-06",
        categoryId: undefined,
      });
      expect(build("0", "2026-02-28")).toMatchObject({ amount: 0 });
    });

    it("今日の日付では、0 円は null", () => {
      expect(build("0", "2026-03-07")).toBeNull();
    });

    it("未来の日付では、0 円は null", () => {
      expect(build("0", "2026-03-08")).toBeNull();
      expect(build("0", "2026-04-01")).toBeNull();
    });

    it("0 円以外は、今日・未来の日付でも作れる（従来どおり）", () => {
      expect(build("100", "2026-03-07")).toMatchObject({ amount: 100 });
      expect(build("100", "2026-03-08")).toMatchObject({ amount: 100 });
    });

    it("負の金額・数値でない入力は、過去の日付でも null", () => {
      expect(build("-1", "2026-03-06")).toBeNull();
      expect(build("abc", "2026-03-06")).toBeNull();
      expect(build("", "2026-03-06")).toBeNull();
    });

    it("now を省略したときは、現在の日付で判定する", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
      try {
        expect(
          buildExpensePayload({
            expenseAmount: "0",
            expenseDate: "2026-03-06",
            expenseCategoryId: "",
          }),
        ).toMatchObject({ amount: 0 });
        expect(
          buildExpensePayload({
            expenseAmount: "0",
            expenseDate: "2026-03-07",
            expenseCategoryId: "",
          }),
        ).toBeNull();
      } finally {
        jest.useRealTimers();
      }
    });
  });
});
