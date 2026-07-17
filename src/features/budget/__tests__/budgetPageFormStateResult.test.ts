import { createBudgetPageFormStateResult } from "../budgetPageFormStateResult";

describe("createBudgetPageFormStateResult", () => {
  it("input と visibility と form actions の公開 shape をまとめて返す", () => {
    const visibilityState = {
      showExpenseForm: true,
      setShowExpenseForm: jest.fn(),
    };
    const inputState = {
      expenseAmount: "1200",
      expenseCategoryId: "category-lunch",
      setExpenseAmount: jest.fn(),
      setExpenseCategoryId: jest.fn(),
    };
    const closeExpenseForm = jest.fn();
    const openExpenseForm = jest.fn();

    const result = createBudgetPageFormStateResult({
      visibilityState,
      inputState,
      closeExpenseForm,
      openExpenseForm,
    });

    expect(result).toEqual({
      ...inputState,
      ...visibilityState,
      closeExpenseForm,
      openExpenseForm,
    });
  });
});
