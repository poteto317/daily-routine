import { createBudgetPageActionHandlersResult } from "../budgetPageActionHandlersResult";

describe("createBudgetPageActionHandlersResult", () => {
  it("budget action handlers を公開 shape に載せる", () => {
    const handleSaveBudget = jest.fn();
    const handleAddExpense = jest.fn();
    const handleUpdateExpense = jest.fn();
    const handleDeleteExpense = jest.fn();

    expect(
      createBudgetPageActionHandlersResult({
        handleSaveBudget,
        handleAddExpense,
        handleUpdateExpense,
        handleDeleteExpense,
      }),
    ).toEqual({
      handleSaveBudget,
      handleAddExpense,
      handleUpdateExpense,
      handleDeleteExpense,
    });
  });
});
