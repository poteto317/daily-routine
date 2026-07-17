import { createBudgetPageActionBindings } from "../budgetPageActionBindings";

describe("budgetPageActionBindings", () => {
  it("budget action handlers 用の依存を束ねる", () => {
    const currentDate = new Date("2026-03-07T00:00:00.000Z");
    const setExpenses = jest.fn();
    const closeExpenseForm = jest.fn();
    const closeExpenseEdit = jest.fn();

    expect(
      createBudgetPageActionBindings({
        closeExpenseForm,
        closeExpenseEdit,
        currentDate,
        currentMonth: "2026-03",
        expenseAmount: "2500",
        expenseDate: "2026-03-05",
        expenseCategoryId: "category-books",
        editingExpenseId: "e-mar",
        editingExpenseAmount: "3000",
        editingExpenseDate: "2026-03-10",
        editingExpenseCategoryId: "category-food",
        setExpenses,
      }),
    ).toEqual({
      closeExpenseForm,
      closeExpenseEdit,
      currentDate,
      currentMonth: "2026-03",
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      editingExpenseId: "e-mar",
      editingExpenseAmount: "3000",
      editingExpenseDate: "2026-03-10",
      editingExpenseCategoryId: "category-food",
      setExpenses,
    });
  });
});
