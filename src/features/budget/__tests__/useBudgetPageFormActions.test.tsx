import { renderHook } from "@testing-library/react";

jest.mock("../budgetPageStateActions", () => ({
  createBudgetInputCloseHandler: jest.fn(),
  createBudgetInputOpenHandler: jest.fn(),
  createExpenseFormCloseHandler: jest.fn(),
  createExpenseFormOpenHandler: jest.fn(),
}));

import {
  createBudgetInputCloseHandler,
  createBudgetInputOpenHandler,
  createExpenseFormCloseHandler,
  createExpenseFormOpenHandler,
} from "../budgetPageStateActions";
import { useBudgetPageFormActions } from "../useBudgetPageFormActions";

describe("useBudgetPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("budget form action を組み立てる", () => {
    const closeBudgetInput = jest.fn();
    const closeExpenseForm = jest.fn();
    const openBudgetInput = jest.fn();
    const openExpenseForm = jest.fn();
    const params = {
      monthBudget: 30000,
      setShowBudgetInput: jest.fn(),
      setBudgetInputValue: jest.fn(),
      setShowExpenseForm: jest.fn(),
      setExpenseAmount: jest.fn(),
      setExpenseCategoryId: jest.fn(),
    };

    (createBudgetInputCloseHandler as jest.Mock).mockReturnValue(
      closeBudgetInput,
    );
    (createExpenseFormCloseHandler as jest.Mock).mockReturnValue(
      closeExpenseForm,
    );
    (createBudgetInputOpenHandler as jest.Mock).mockReturnValue(
      openBudgetInput,
    );
    (createExpenseFormOpenHandler as jest.Mock).mockReturnValue(
      openExpenseForm,
    );

    const { result } = renderHook(() => useBudgetPageFormActions(params));

    expect(createBudgetInputCloseHandler).toHaveBeenCalledWith({
      setShowBudgetInput: params.setShowBudgetInput,
      setBudgetInputValue: params.setBudgetInputValue,
    });
    expect(createExpenseFormCloseHandler).toHaveBeenCalledWith({
      setShowExpenseForm: params.setShowExpenseForm,
      setExpenseAmount: params.setExpenseAmount,
      setExpenseCategoryId: params.setExpenseCategoryId,
    });
    expect(createBudgetInputOpenHandler).toHaveBeenCalledWith({
      monthBudget: params.monthBudget,
      setBudgetInputValue: params.setBudgetInputValue,
      setShowBudgetInput: params.setShowBudgetInput,
    });
    expect(createExpenseFormOpenHandler).toHaveBeenCalledWith({
      setShowExpenseForm: params.setShowExpenseForm,
    });
    expect(result.current).toEqual({
      closeBudgetInput,
      closeExpenseForm,
      openBudgetInput,
      openExpenseForm,
    });
  });
});
