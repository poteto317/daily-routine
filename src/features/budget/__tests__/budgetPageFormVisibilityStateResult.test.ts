import { createBudgetPageFormVisibilityStateResult } from "../budgetPageFormVisibilityStateResult";

describe("createBudgetPageFormVisibilityStateResult", () => {
  it("form visibility state の公開 shape を返す", () => {
    const setShowExpenseForm = jest.fn();

    expect(
      createBudgetPageFormVisibilityStateResult({
        showExpenseForm: false,
        setShowExpenseForm,
      }),
    ).toEqual({
      showExpenseForm: false,
      setShowExpenseForm,
    });
  });
});
