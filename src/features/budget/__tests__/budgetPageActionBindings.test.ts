import { createBudgetPageActionBindings } from "../budgetPageActionBindings";

describe("budgetPageActionBindings", () => {
  it("budget action handlers 用の依存を束ねる", () => {
    const currentDate = new Date("2026-03-07T00:00:00.000Z");
    const setExpenses = jest.fn();
    const setMonthBudget = jest.fn();
    const closeBudgetInput = jest.fn();
    const closeExpenseForm = jest.fn();

    expect(
      createBudgetPageActionBindings({
        budgetInputValue: "45000",
        closeBudgetInput,
        closeExpenseForm,
        currentDate,
        currentMonth: "2026-03",
        expenseAmount: "2500",
        expenseDate: "2026-03-05",
        expenseCategoryId: "category-books",
        setExpenses,
        setMonthBudget,
      }),
    ).toEqual({
      budgetInputValue: "45000",
      closeBudgetInput,
      closeExpenseForm,
      currentDate,
      currentMonth: "2026-03",
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      setExpenses,
      setMonthBudget,
    });
  });
});
