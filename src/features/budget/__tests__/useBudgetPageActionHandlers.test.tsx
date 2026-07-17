import { act, renderHook } from "@testing-library/react";

jest.mock("../useBudgetExpenseActions", () => ({
  useBudgetExpenseActions: jest.fn(),
}));

jest.mock("../budgetPageActionHandlersResult", () => ({
  createBudgetPageActionHandlersResult: jest.fn(),
}));

import { createBudgetPageActionHandlersResult } from "../budgetPageActionHandlersResult";
import { useBudgetExpenseActions } from "../useBudgetExpenseActions";
import { useBudgetPageActionHandlers } from "../useBudgetPageActionHandlers";

describe("useBudgetPageActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("expense actions hook を compose して委譲する", () => {
    const addHandler = jest.fn();
    const updateHandler = jest.fn();
    const deleteHandler = jest.fn();
    const resultShape = {
      handleAddExpense: jest.fn(),
      handleUpdateExpense: jest.fn(),
      handleDeleteExpense: jest.fn(),
      composed: true,
    };

    (useBudgetExpenseActions as jest.Mock).mockReturnValue({
      handleAddExpense: addHandler,
      handleUpdateExpense: updateHandler,
      handleDeleteExpense: deleteHandler,
    });
    (createBudgetPageActionHandlersResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      currentMonth: "2026-03",
      currentDate: new Date("2026-03-07T00:00:00.000Z"),
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      editingExpenseId: "e-mar",
      editingExpenseAmount: "3000",
      editingExpenseDate: "2026-03-10",
      editingExpenseCategoryId: "category-food",
      setExpenses: jest.fn(),
      closeExpenseForm: jest.fn(),
      closeExpenseEdit: jest.fn(),
    };

    const { result } = renderHook(() => useBudgetPageActionHandlers(params));

    expect(result.current).toBe(resultShape);
    expect(createBudgetPageActionHandlersResult).toHaveBeenCalledWith({
      handleAddExpense: addHandler,
      handleUpdateExpense: updateHandler,
      handleDeleteExpense: deleteHandler,
    });

    const builtHandlers = (createBudgetPageActionHandlersResult as jest.Mock)
      .mock.calls[0][0] as {
      handleAddExpense: () => void;
      handleUpdateExpense: () => void;
      handleDeleteExpense: (expenseId: string) => void;
    };

    act(() => {
      builtHandlers.handleAddExpense();
      builtHandlers.handleUpdateExpense();
      builtHandlers.handleDeleteExpense("e-mar");
    });

    expect(useBudgetExpenseActions).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      currentDate: params.currentDate,
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      editingExpenseId: "e-mar",
      editingExpenseAmount: "3000",
      editingExpenseDate: "2026-03-10",
      editingExpenseCategoryId: "category-food",
      setExpenses: params.setExpenses,
      closeExpenseForm: params.closeExpenseForm,
      closeExpenseEdit: params.closeExpenseEdit,
    });
    expect(addHandler).toHaveBeenCalled();
    expect(updateHandler).toHaveBeenCalled();
    expect(deleteHandler).toHaveBeenCalledWith("e-mar");
  });
});
