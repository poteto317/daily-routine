import { createBudgetPageActionHandlersResult } from "../budgetPageActionHandlersResult";

describe("createBudgetPageActionHandlersResult", () => {
  it("budget action handlers を公開 shape に載せる", () => {
    const handleAddExpense = jest.fn();
    const handleUpdateExpense = jest.fn();
    const handleDeleteExpense = jest.fn();

    expect(
      createBudgetPageActionHandlersResult({
        handleAddExpense,
        handleUpdateExpense,
        handleDeleteExpense,
      }),
    ).toEqual({
      handleAddExpense,
      handleUpdateExpense,
      handleDeleteExpense,
    });
  });
});
