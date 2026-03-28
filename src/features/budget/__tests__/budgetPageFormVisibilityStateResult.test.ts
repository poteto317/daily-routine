import { createBudgetPageFormVisibilityStateResult } from "../budgetPageFormVisibilityStateResult";

describe("createBudgetPageFormVisibilityStateResult", () => {
  it("form visibility state の公開 shape を返す", () => {
    const setShowBudgetInput = jest.fn();
    const setShowExpenseForm = jest.fn();

    expect(
      createBudgetPageFormVisibilityStateResult({
        showBudgetInput: true,
        showExpenseForm: false,
        setShowBudgetInput,
        setShowExpenseForm,
      }),
    ).toEqual({
      showBudgetInput: true,
      showExpenseForm: false,
      setShowBudgetInput,
      setShowExpenseForm,
    });
  });
});
