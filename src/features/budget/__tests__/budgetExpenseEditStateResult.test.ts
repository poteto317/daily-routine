import { createBudgetExpenseEditStateResult } from "../budgetExpenseEditStateResult";

describe("createBudgetExpenseEditStateResult", () => {
  it("支出編集 state の公開 shape を返す", () => {
    const setEditingExpenseDate = jest.fn();
    const setEditingExpenseAmount = jest.fn();
    const setEditingExpenseCategoryId = jest.fn();
    const startEditExpense = jest.fn();
    const cancelEditExpense = jest.fn();

    expect(
      createBudgetExpenseEditStateResult({
        editingExpenseId: "e1",
        editingExpenseDate: "2026-03-05",
        editingExpenseAmount: "2500",
        editingExpenseCategoryId: "category-books",
        setEditingExpenseDate,
        setEditingExpenseAmount,
        setEditingExpenseCategoryId,
        startEditExpense,
        cancelEditExpense,
      }),
    ).toEqual({
      editingExpenseId: "e1",
      editingExpenseDate: "2026-03-05",
      editingExpenseAmount: "2500",
      editingExpenseCategoryId: "category-books",
      setEditingExpenseDate,
      setEditingExpenseAmount,
      setEditingExpenseCategoryId,
      startEditExpense,
      cancelEditExpense,
    });
  });
});
