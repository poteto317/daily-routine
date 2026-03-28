import { act, renderHook } from "@testing-library/react";
import { createBudgetPageFormVisibilityStateResult } from "../budgetPageFormVisibilityStateResult";
import { useBudgetPageFormVisibilityState } from "../useBudgetPageFormVisibilityState";

jest.mock("../budgetPageFormVisibilityStateResult", () => ({
  createBudgetPageFormVisibilityStateResult: jest.fn(),
}));

describe("useBudgetPageFormVisibilityState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createBudgetPageFormVisibilityStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("予算入力フォームと支出フォームの表示 state を管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageFormVisibilityState({
        initialShowBudgetInput: false,
        initialShowExpenseForm: true,
      }),
    );

    expect(createBudgetPageFormVisibilityStateResult).toHaveBeenCalledWith({
      showBudgetInput: false,
      showExpenseForm: true,
      setShowBudgetInput: expect.any(Function),
      setShowExpenseForm: expect.any(Function),
    });

    expect(result.current.showBudgetInput).toBe(false);
    expect(result.current.showExpenseForm).toBe(true);

    act(() => {
      result.current.setShowBudgetInput(true);
      result.current.setShowExpenseForm(false);
    });

    expect(result.current.showBudgetInput).toBe(true);
    expect(result.current.showExpenseForm).toBe(false);
    expect(createBudgetPageFormVisibilityStateResult).toHaveBeenLastCalledWith({
      showBudgetInput: true,
      showExpenseForm: false,
      setShowBudgetInput: expect.any(Function),
      setShowExpenseForm: expect.any(Function),
    });
  });
});
