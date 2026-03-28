import { act, renderHook } from "@testing-library/react";

jest.mock("../useBudgetSaveAction", () => ({
  useBudgetSaveAction: jest.fn(),
}));

jest.mock("../useBudgetExpenseActions", () => ({
  useBudgetExpenseActions: jest.fn(),
}));

jest.mock("../budgetPageActionHandlersResult", () => ({
  createBudgetPageActionHandlersResult: jest.fn(),
}));

import { createBudgetPageActionHandlersResult } from "../budgetPageActionHandlersResult";
import { useBudgetExpenseActions } from "../useBudgetExpenseActions";
import { useBudgetPageActionHandlers } from "../useBudgetPageActionHandlers";
import { useBudgetSaveAction } from "../useBudgetSaveAction";

describe("useBudgetPageActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("save action hook と expense actions hook を compose して委譲する", () => {
    const saveHandler = jest.fn();
    const addHandler = jest.fn();
    const deleteHandler = jest.fn();
    const resultShape = {
      handleSaveBudget: jest.fn(),
      handleAddExpense: jest.fn(),
      handleDeleteExpense: jest.fn(),
      composed: true,
    };

    (useBudgetSaveAction as jest.Mock).mockReturnValue({
      handleSaveBudget: saveHandler,
    });
    (useBudgetExpenseActions as jest.Mock).mockReturnValue({
      handleAddExpense: addHandler,
      handleDeleteExpense: deleteHandler,
    });
    (createBudgetPageActionHandlersResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      currentMonth: "2026-03",
      currentDate: new Date("2026-03-07T00:00:00.000Z"),
      budgetInputValue: "45000",
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseDescription: "書籍",
      setMonthBudget: jest.fn(),
      setExpenses: jest.fn(),
      closeBudgetInput: jest.fn(),
      closeExpenseForm: jest.fn(),
    };

    const { result } = renderHook(() => useBudgetPageActionHandlers(params));

    expect(result.current).toBe(resultShape);
    expect(createBudgetPageActionHandlersResult).toHaveBeenCalledWith({
      handleSaveBudget: saveHandler,
      handleAddExpense: addHandler,
      handleDeleteExpense: deleteHandler,
    });

    const builtHandlers = (createBudgetPageActionHandlersResult as jest.Mock)
      .mock.calls[0][0] as {
      handleSaveBudget: () => void;
      handleAddExpense: () => void;
      handleDeleteExpense: (expenseId: string) => void;
    };

    act(() => {
      builtHandlers.handleSaveBudget();
      builtHandlers.handleAddExpense();
      builtHandlers.handleDeleteExpense("e-mar");
    });

    expect(useBudgetSaveAction).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      budgetInputValue: "45000",
      setMonthBudget: params.setMonthBudget,
      closeBudgetInput: params.closeBudgetInput,
    });
    expect(useBudgetExpenseActions).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      currentDate: params.currentDate,
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseDescription: "書籍",
      setExpenses: params.setExpenses,
      closeExpenseForm: params.closeExpenseForm,
    });
    expect(saveHandler).toHaveBeenCalled();
    expect(addHandler).toHaveBeenCalled();
    expect(deleteHandler).toHaveBeenCalledWith("e-mar");
  });
});
