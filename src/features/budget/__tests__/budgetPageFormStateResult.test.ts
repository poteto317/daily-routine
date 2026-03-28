import { createBudgetPageFormStateResult } from "../budgetPageFormStateResult";

describe("createBudgetPageFormStateResult", () => {
  it("input と visibility と form actions の公開 shape をまとめて返す", () => {
    const visibilityState = {
      showBudgetInput: false,
      showExpenseForm: true,
      setShowBudgetInput: jest.fn(),
      setShowExpenseForm: jest.fn(),
    };
    const inputState = {
      budgetInputValue: "30000",
      expenseAmount: "1200",
      expenseDescription: "ランチ",
      setBudgetInputValue: jest.fn(),
      setExpenseAmount: jest.fn(),
      setExpenseDescription: jest.fn(),
    };
    const closeBudgetInput = jest.fn();
    const closeExpenseForm = jest.fn();
    const openBudgetInput = jest.fn();
    const openExpenseForm = jest.fn();

    const result = createBudgetPageFormStateResult({
      visibilityState,
      inputState,
      closeBudgetInput,
      closeExpenseForm,
      openBudgetInput,
      openExpenseForm,
    });

    expect(result).toEqual({
      ...inputState,
      ...visibilityState,
      closeBudgetInput,
      closeExpenseForm,
      openBudgetInput,
      openExpenseForm,
    });
  });
});
