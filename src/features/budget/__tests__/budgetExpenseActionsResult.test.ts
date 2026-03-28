import { createBudgetExpenseActionsResult } from "../budgetExpenseActionsResult";

describe("createBudgetExpenseActionsResult", () => {
  it("expense handlers を公開 shape に載せる", () => {
    const handleAddExpense = jest.fn();
    const handleDeleteExpense = jest.fn();

    expect(
      createBudgetExpenseActionsResult({
        handleAddExpense,
        handleDeleteExpense,
      }),
    ).toEqual({
      handleAddExpense,
      handleDeleteExpense,
    });
  });
});
