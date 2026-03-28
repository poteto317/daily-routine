import { createBudgetSaveActionResult } from "../budgetSaveActionResult";

describe("createBudgetSaveActionResult", () => {
  it("handleSaveBudget を公開 shape に載せる", () => {
    const handleSaveBudget = jest.fn();

    expect(createBudgetSaveActionResult({ handleSaveBudget })).toEqual({
      handleSaveBudget,
    });
  });
});
