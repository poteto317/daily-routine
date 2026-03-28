import { createBudgetPageInputHandlers } from "../budgetPageInputHandlers";

describe("budgetPageInputHandlers", () => {
  it("各入力 handler を対応する setter に委譲する", () => {
    const setBudgetInputValue = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseDate = jest.fn();
    const setExpenseDescription = jest.fn();

    const handlers = createBudgetPageInputHandlers({
      setBudgetInputValue,
      setExpenseAmount,
      setExpenseDate,
      setExpenseDescription,
    });

    handlers.handleBudgetInputChange("45000");
    handlers.handleExpenseAmountChange("1200");
    handlers.handleExpenseDateChange("2026-03-08");
    handlers.handleExpenseDescriptionChange("交通費");

    expect(setBudgetInputValue).toHaveBeenCalledWith("45000");
    expect(setExpenseAmount).toHaveBeenCalledWith("1200");
    expect(setExpenseDate).toHaveBeenCalledWith("2026-03-08");
    expect(setExpenseDescription).toHaveBeenCalledWith("交通費");
  });
});
