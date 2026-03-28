import { createBudgetPageInputStateResult } from "../budgetPageInputStateResult";

describe("createBudgetPageInputStateResult", () => {
  it("input state の公開 shape を返す", () => {
    const setBudgetInputValue = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseDescription = jest.fn();

    expect(
      createBudgetPageInputStateResult({
        budgetInputValue: "45000",
        expenseAmount: "2500",
        expenseDescription: "書籍",
        setBudgetInputValue,
        setExpenseAmount,
        setExpenseDescription,
      }),
    ).toEqual({
      budgetInputValue: "45000",
      expenseAmount: "2500",
      expenseDescription: "書籍",
      setBudgetInputValue,
      setExpenseAmount,
      setExpenseDescription,
    });
  });
});
