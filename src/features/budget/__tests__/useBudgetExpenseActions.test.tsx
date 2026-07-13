import { act, renderHook } from "@testing-library/react";

jest.mock("../budgetPageStateActions", () => ({
  createExpenseAddHandler: jest.fn(),
  createExpenseDeleteHandler: jest.fn(),
  createExpenseUpdateHandler: jest.fn(),
}));

jest.mock("../budgetExpenseActionsResult", () => ({
  createBudgetExpenseActionsResult: jest.fn(),
}));

import {
  createExpenseAddHandler,
  createExpenseDeleteHandler,
  createExpenseUpdateHandler,
} from "../budgetPageStateActions";
import { createBudgetExpenseActionsResult } from "../budgetExpenseActionsResult";
import { useBudgetExpenseActions } from "../useBudgetExpenseActions";

describe("useBudgetExpenseActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("add/update/delete handler を組み立てて委譲する", () => {
    const addHandler = jest.fn();
    const updateHandler = jest.fn();
    const deleteHandler = jest.fn();
    const resultShape = {
      handleAddExpense: jest.fn(),
      handleUpdateExpense: jest.fn(),
      handleDeleteExpense: jest.fn(),
      composed: true,
    };

    (createExpenseAddHandler as jest.Mock).mockReturnValue(addHandler);
    (createExpenseUpdateHandler as jest.Mock).mockReturnValue(updateHandler);
    (createExpenseDeleteHandler as jest.Mock).mockReturnValue(deleteHandler);
    (createBudgetExpenseActionsResult as jest.Mock).mockReturnValue(
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

    const { result } = renderHook(() => useBudgetExpenseActions(params));

    expect(result.current).toBe(resultShape);
    expect(createBudgetExpenseActionsResult).toHaveBeenCalledWith({
      handleAddExpense: addHandler,
      handleUpdateExpense: updateHandler,
      handleDeleteExpense: deleteHandler,
    });

    const builtHandlers = (createBudgetExpenseActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleAddExpense: () => void;
      handleUpdateExpense: () => void;
      handleDeleteExpense: (expenseId: string) => void;
    };

    act(() => {
      builtHandlers.handleAddExpense();
      builtHandlers.handleUpdateExpense();
      builtHandlers.handleDeleteExpense("e-mar");
    });

    expect(createExpenseAddHandler).toHaveBeenCalledWith({
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      currentDate: params.currentDate,
      setExpenses: params.setExpenses,
      closeExpenseForm: params.closeExpenseForm,
    });
    expect(createExpenseUpdateHandler).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      editingExpenseId: "e-mar",
      editingExpenseAmount: "3000",
      editingExpenseDate: "2026-03-10",
      editingExpenseCategoryId: "category-food",
      currentDate: params.currentDate,
      setExpenses: params.setExpenses,
      closeExpenseEdit: params.closeExpenseEdit,
    });
    expect(createExpenseDeleteHandler).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      currentDate: params.currentDate,
      setExpenses: params.setExpenses,
    });
    expect(addHandler).toHaveBeenCalled();
    expect(updateHandler).toHaveBeenCalled();
    expect(deleteHandler).toHaveBeenCalledWith("e-mar");
  });
});
