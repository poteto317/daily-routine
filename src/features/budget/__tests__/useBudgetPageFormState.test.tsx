import { act, renderHook } from "@testing-library/react";
import { useBudgetPageFormState } from "../useBudgetPageFormState";

describe("useBudgetPageFormState", () => {
  const initialState = {
    showExpenseForm: false,
    expenseAmount: "",
    expenseCategoryId: "",
  };

  it("初期フォーム状態と変更ハンドラを管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageFormState({ initialState }),
    );

    expect(result.current.showExpenseForm).toBe(false);

    act(() => {
      result.current.setExpenseAmount("1200");
      result.current.setExpenseCategoryId("category-lunch");
    });

    expect(result.current.expenseAmount).toBe("1200");
    expect(result.current.expenseCategoryId).toBe("category-lunch");
  });

  it("支出フォームの open/close を管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageFormState({ initialState }),
    );

    act(() => {
      result.current.openExpenseForm();
    });

    expect(result.current.showExpenseForm).toBe(true);

    act(() => {
      result.current.setExpenseAmount("999");
      result.current.setExpenseCategoryId("category-books");
      result.current.closeExpenseForm();
    });

    expect(result.current.showExpenseForm).toBe(false);
    expect(result.current.expenseAmount).toBe("");
    expect(result.current.expenseCategoryId).toBe("");
  });
});
