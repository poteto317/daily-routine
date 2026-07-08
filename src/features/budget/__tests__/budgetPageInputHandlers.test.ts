import { createBudgetPageInputHandlers } from "../budgetPageInputHandlers";

describe("budgetPageInputHandlers", () => {
  it("各入力 handler を対応する setter に委譲する", () => {
    const setBudgetInputValue = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseDate = jest.fn();
    const setExpenseCategoryId = jest.fn();

    const handlers = createBudgetPageInputHandlers({
      setBudgetInputValue,
      setExpenseAmount,
      setExpenseDate,
      setExpenseCategoryId,
    });

    handlers.handleBudgetInputChange("45000");
    handlers.handleExpenseAmountChange("1200");
    handlers.handleExpenseDateChange("2026-03-08");
    handlers.handleExpenseCategoryIdChange("category-transport");

    expect(setBudgetInputValue).toHaveBeenCalledWith("45000");
    expect(setExpenseAmount).toHaveBeenCalledWith("1200");
    expect(setExpenseDate).toHaveBeenCalledWith("2026-03-08");
    expect(setExpenseCategoryId).toHaveBeenCalledWith("category-transport");
  });
});
