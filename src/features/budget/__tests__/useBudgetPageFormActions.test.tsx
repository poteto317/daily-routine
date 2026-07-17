import { renderHook } from "@testing-library/react";

jest.mock("../budgetPageStateActions", () => ({
  createExpenseFormCloseHandler: jest.fn(),
  createExpenseFormOpenHandler: jest.fn(),
}));

import {
  createExpenseFormCloseHandler,
  createExpenseFormOpenHandler,
} from "../budgetPageStateActions";
import { useBudgetPageFormActions } from "../useBudgetPageFormActions";

describe("useBudgetPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("budget form action を組み立てる", () => {
    const closeExpenseForm = jest.fn();
    const openExpenseForm = jest.fn();
    const params = {
      setShowExpenseForm: jest.fn(),
      setExpenseAmount: jest.fn(),
      setExpenseCategoryId: jest.fn(),
    };

    (createExpenseFormCloseHandler as jest.Mock).mockReturnValue(
      closeExpenseForm,
    );
    (createExpenseFormOpenHandler as jest.Mock).mockReturnValue(
      openExpenseForm,
    );

    const { result } = renderHook(() => useBudgetPageFormActions(params));

    expect(createExpenseFormCloseHandler).toHaveBeenCalledWith({
      setShowExpenseForm: params.setShowExpenseForm,
      setExpenseAmount: params.setExpenseAmount,
      setExpenseCategoryId: params.setExpenseCategoryId,
    });
    expect(createExpenseFormOpenHandler).toHaveBeenCalledWith({
      setShowExpenseForm: params.setShowExpenseForm,
    });
    expect(result.current).toEqual({
      closeExpenseForm,
      openExpenseForm,
    });
  });
});
