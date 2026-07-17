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

  it("支出フォームの表示 state を管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageFormVisibilityState({
        initialShowExpenseForm: true,
      }),
    );

    expect(createBudgetPageFormVisibilityStateResult).toHaveBeenCalledWith({
      showExpenseForm: true,
      setShowExpenseForm: expect.any(Function),
    });

    expect(result.current.showExpenseForm).toBe(true);

    act(() => {
      result.current.setShowExpenseForm(false);
    });

    expect(result.current.showExpenseForm).toBe(false);
    expect(createBudgetPageFormVisibilityStateResult).toHaveBeenLastCalledWith({
      showExpenseForm: false,
      setShowExpenseForm: expect.any(Function),
    });
  });
});
