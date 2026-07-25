import { act, renderHook } from "@testing-library/react";
import { useBudgetExpenseEditState } from "../useBudgetExpenseEditState";

describe("useBudgetExpenseEditState", () => {
  it("初期状態では編集対象なし", () => {
    const { result } = renderHook(() => useBudgetExpenseEditState());

    expect(result.current.editingExpenseId).toBeNull();
    expect(result.current.editingExpenseDate).toBe("");
    expect(result.current.editingExpenseAmount).toBe("");
    expect(result.current.editingExpenseCategoryId).toBe("");
    expect(result.current.editingExpenseUsedTime).toBe("");
  });

  it("startEditExpenseで対象支出の値を編集stateへセットする", () => {
    const { result } = renderHook(() => useBudgetExpenseEditState());

    act(() => {
      result.current.startEditExpense({
        id: "e1",
        date: "2026-03-05",
        amount: 2500,
        categoryId: "category-books",
        createdAt: "2026-03-05T00:00:00.000Z",
        usedTime: "16:20",
      });
    });

    expect(result.current.editingExpenseId).toBe("e1");
    expect(result.current.editingExpenseDate).toBe("2026-03-05");
    expect(result.current.editingExpenseAmount).toBe("2500");
    expect(result.current.editingExpenseCategoryId).toBe("category-books");
    expect(result.current.editingExpenseUsedTime).toBe("16:20");
  });

  it("startEditExpenseはusedTime未設定の支出ならcreatedAtの時刻部分（ローカル）へフォールバックする", () => {
    const { result } = renderHook(() => useBudgetExpenseEditState());

    act(() => {
      result.current.startEditExpense({
        id: "e1",
        date: "2026-03-05",
        amount: 2500,
        // "2026-03-05T00:00:00.000Z" はJST（UTC+9）で09:00になる。
        createdAt: "2026-03-05T00:00:00.000Z",
      });
    });

    expect(result.current.editingExpenseUsedTime).toBe("09:00");
  });

  it("categoryId未設定の支出は空文字として編集stateへセットする", () => {
    const { result } = renderHook(() => useBudgetExpenseEditState());

    act(() => {
      result.current.startEditExpense({
        id: "e2",
        date: "2026-03-06",
        amount: 800,
        createdAt: "2026-03-06T00:00:00.000Z",
      });
    });

    expect(result.current.editingExpenseCategoryId).toBe("");
  });

  it("編集中の入力値をセッターで更新できる", () => {
    const { result } = renderHook(() => useBudgetExpenseEditState());

    act(() => {
      result.current.startEditExpense({
        id: "e1",
        date: "2026-03-05",
        amount: 2500,
        createdAt: "2026-03-05T00:00:00.000Z",
      });
    });

    act(() => {
      result.current.setEditingExpenseDate("2026-03-10");
      result.current.setEditingExpenseAmount("3000");
      result.current.setEditingExpenseCategoryId("category-food");
      result.current.setEditingExpenseUsedTime("19:00");
    });

    expect(result.current.editingExpenseDate).toBe("2026-03-10");
    expect(result.current.editingExpenseAmount).toBe("3000");
    expect(result.current.editingExpenseCategoryId).toBe("category-food");
    expect(result.current.editingExpenseUsedTime).toBe("19:00");
  });

  it("cancelEditExpenseで編集対象を解除する", () => {
    const { result } = renderHook(() => useBudgetExpenseEditState());

    act(() => {
      result.current.startEditExpense({
        id: "e1",
        date: "2026-03-05",
        amount: 2500,
        createdAt: "2026-03-05T00:00:00.000Z",
      });
    });

    act(() => {
      result.current.cancelEditExpense();
    });

    expect(result.current.editingExpenseId).toBeNull();
  });
});
