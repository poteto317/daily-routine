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
});
