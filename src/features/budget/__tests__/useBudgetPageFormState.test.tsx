import { act, renderHook } from "@testing-library/react";
import { useBudgetPageFormState } from "../useBudgetPageFormState";

describe("useBudgetPageFormState", () => {
  const initialState = {
    showBudgetInput: false,
    budgetInputValue: "",
    showExpenseForm: false,
    expenseAmount: "",
    expenseDescription: "",
  };

  it("初期フォーム状態と変更ハンドラを管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageFormState({
        initialState,
        monthBudget: 30000,
      }),
    );

    expect(result.current.showBudgetInput).toBe(false);
    expect(result.current.showExpenseForm).toBe(false);

    act(() => {
      result.current.setBudgetInputValue("45000");
      result.current.setExpenseAmount("1200");
      result.current.setExpenseDescription("ランチ");
    });

    expect(result.current.budgetInputValue).toBe("45000");
    expect(result.current.expenseAmount).toBe("1200");
    expect(result.current.expenseDescription).toBe("ランチ");
  });

  it("予算入力と支出フォームの open/close を管理する", () => {
    const { result } = renderHook(() =>
      useBudgetPageFormState({
        initialState,
        monthBudget: 30000,
      }),
    );

    act(() => {
      result.current.openBudgetInput();
      result.current.openExpenseForm();
    });

    expect(result.current.showBudgetInput).toBe(true);
    expect(result.current.budgetInputValue).toBe("30000");
    expect(result.current.showExpenseForm).toBe(true);

    act(() => {
      result.current.setExpenseAmount("999");
      result.current.setExpenseDescription("書籍");
      result.current.closeBudgetInput();
      result.current.closeExpenseForm();
    });

    expect(result.current.showBudgetInput).toBe(false);
    expect(result.current.budgetInputValue).toBe("");
    expect(result.current.showExpenseForm).toBe(false);
    expect(result.current.expenseAmount).toBe("");
    expect(result.current.expenseDescription).toBe("");
  });

  it("monthBudget の変化に応じて openBudgetInput の初期値が変わる", () => {
    const { result, rerender } = renderHook(
      ({ monthBudget }) =>
        useBudgetPageFormState({
          initialState,
          monthBudget,
        }),
      {
        initialProps: { monthBudget: 30000 },
      },
    );

    act(() => {
      result.current.openBudgetInput();
    });

    expect(result.current.budgetInputValue).toBe("30000");

    act(() => {
      result.current.closeBudgetInput();
    });

    rerender({ monthBudget: 50000 });

    act(() => {
      result.current.openBudgetInput();
    });

    expect(result.current.budgetInputValue).toBe("50000");
  });
});
