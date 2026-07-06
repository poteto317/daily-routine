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

  it("予算入力と支出入力 state を管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageInputState({
        initialBudgetInputValue: "30000",
        initialExpenseAmount: "1200",
        initialExpenseCategoryId: "category-lunch",
      }),
    );

    expect(createBudgetPageInputStateResult).toHaveBeenCalledWith({
      budgetInputValue: "30000",
      expenseAmount: "1200",
      expenseCategoryId: "category-lunch",
      setBudgetInputValue: expect.any(Function),
      setExpenseAmount: expect.any(Function),
      setExpenseCategoryId: expect.any(Function),
    });

    expect(result.current.budgetInputValue).toBe("30000");
    expect(result.current.expenseAmount).toBe("1200");
    expect(result.current.expenseCategoryId).toBe("category-lunch");

    act(() => {
      result.current.setBudgetInputValue("45000");
      result.current.setExpenseAmount("2500");
      result.current.setExpenseCategoryId("category-books");
    });

    expect(result.current.budgetInputValue).toBe("45000");
    expect(result.current.expenseAmount).toBe("2500");
    expect(result.current.expenseCategoryId).toBe("category-books");
    expect(createBudgetPageInputStateResult).toHaveBeenLastCalledWith({
      budgetInputValue: "45000",
      expenseAmount: "2500",
      expenseCategoryId: "category-books",
      setBudgetInputValue: expect.any(Function),
      setExpenseAmount: expect.any(Function),
      setExpenseCategoryId: expect.any(Function),
    });
  });
});
