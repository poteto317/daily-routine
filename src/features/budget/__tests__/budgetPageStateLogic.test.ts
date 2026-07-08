import {
  buildBudgetSavePayload,
  buildExpensePayload,
  getBudgetInputInitialValue,
} from "../budgetPageStateLogic";

describe("budgetPageStateLogic", () => {
  it("有効な予算入力から保存payloadを作る", () => {
    expect(buildBudgetSavePayload("2026-03", "12000")).toEqual({
      monthKey: "2026-03",
      amount: 12000,
    });
  });

  it("無効な予算入力ではnullを返す", () => {
    expect(buildBudgetSavePayload("2026-03", "0")).toBeNull();
    expect(buildBudgetSavePayload("2026-03", "abc")).toBeNull();
  });

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

  it("予算入力欄の初期値を返す", () => {
    expect(getBudgetInputInitialValue(30000)).toBe("30000");
    expect(getBudgetInputInitialValue(0)).toBe("");
  });
});
