import { createBudgetPageInputHandlers } from "../budgetPageInputHandlers";

describe("budgetPageInputHandlers", () => {
  it("各入力 handler を対応する setter に委譲する", () => {
    const setExpenseAmount = jest.fn();
    const setExpenseDate = jest.fn();
    const setExpenseCategoryId = jest.fn();
    const setEditingExpenseAmount = jest.fn();
    const setEditingExpenseDate = jest.fn();
    const setEditingExpenseCategoryId = jest.fn();

    const handlers = createBudgetPageInputHandlers({
      setExpenseAmount,
      setExpenseDate,
      setExpenseCategoryId,
      setEditingExpenseAmount,
      setEditingExpenseDate,
      setEditingExpenseCategoryId,
    });

    handlers.handleExpenseAmountChange("1200");
    handlers.handleExpenseDateChange("2026-03-08");
    handlers.handleExpenseCategoryIdChange("category-transport");
    handlers.handleEditExpenseAmountChange("3000");
    handlers.handleEditExpenseDateChange("2026-03-10");
    handlers.handleEditExpenseCategoryIdChange("category-food");

    expect(setExpenseAmount).toHaveBeenCalledWith("1200");
    expect(setExpenseDate).toHaveBeenCalledWith("2026-03-08");
    expect(setExpenseCategoryId).toHaveBeenCalledWith("category-transport");
    expect(setEditingExpenseAmount).toHaveBeenCalledWith("3000");
    expect(setEditingExpenseDate).toHaveBeenCalledWith("2026-03-10");
    expect(setEditingExpenseCategoryId).toHaveBeenCalledWith("category-food");
  });
});
