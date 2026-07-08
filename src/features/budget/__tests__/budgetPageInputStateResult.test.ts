import { createBudgetPageInputStateResult } from "../budgetPageInputStateResult";

describe("createBudgetPageInputStateResult", () => {
  it("input state の公開 shape を返す", () => {
    const setBudgetInputValue = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseCategoryId = jest.fn();

    expect(
      createBudgetPageInputStateResult({
        budgetInputValue: "45000",
        expenseAmount: "2500",
        expenseCategoryId: "category-books",
        setBudgetInputValue,
        setExpenseAmount,
        setExpenseCategoryId,
      }),
    ).toEqual({
      budgetInputValue: "45000",
      expenseAmount: "2500",
      expenseCategoryId: "category-books",
      setBudgetInputValue,
      setExpenseAmount,
      setExpenseCategoryId,
    });
  });
});
