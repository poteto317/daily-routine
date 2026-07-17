import { act, renderHook } from "@testing-library/react";
import { createBudgetPageInputStateResult } from "../budgetPageInputStateResult";
import { useBudgetPageInputState } from "../useBudgetPageInputState";

jest.mock("../budgetPageInputStateResult", () => ({
  createBudgetPageInputStateResult: jest.fn(),
}));

describe("useBudgetPageInputState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createBudgetPageInputStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("支出入力 state を管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageInputState({
        initialExpenseAmount: "1200",
        initialExpenseCategoryId: "category-lunch",
      }),
    );

    expect(createBudgetPageInputStateResult).toHaveBeenCalledWith({
      expenseAmount: "1200",
      expenseCategoryId: "category-lunch",
      setExpenseAmount: expect.any(Function),
      setExpenseCategoryId: expect.any(Function),
    });

    expect(result.current.expenseAmount).toBe("1200");
    expect(result.current.expenseCategoryId).toBe("category-lunch");

    act(() => {
      result.current.setExpenseAmount("2500");
      result.current.setExpenseCategoryId("category-books");
    });

    expect(result.current.expenseAmount).toBe("2500");
    expect(result.current.expenseCategoryId).toBe("category-books");
    expect(createBudgetPageInputStateResult).toHaveBeenLastCalledWith({
      expenseAmount: "2500",
      expenseCategoryId: "category-books",
      setExpenseAmount: expect.any(Function),
      setExpenseCategoryId: expect.any(Function),
    });
  });
});
