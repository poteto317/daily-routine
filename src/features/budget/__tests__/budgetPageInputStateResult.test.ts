import { createBudgetPageInputStateResult } from "../budgetPageInputStateResult";

describe("createBudgetPageInputStateResult", () => {
  it("input state の公開 shape を返す", () => {
    const setExpenseAmount = jest.fn();
    const setExpenseCategoryId = jest.fn();

    expect(
      createBudgetPageInputStateResult({
        expenseAmount: "2500",
        expenseCategoryId: "category-books",
        setExpenseAmount,
        setExpenseCategoryId,
      }),
    ).toEqual({
      expenseAmount: "2500",
      expenseCategoryId: "category-books",
      setExpenseAmount,
      setExpenseCategoryId,
    });
  });
});
