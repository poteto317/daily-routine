import { act, renderHook } from "@testing-library/react";
import { useBudgetItemEditState } from "../useBudgetItemEditState";

const expenseItem = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

const incomeItem = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetItemEditState", () => {
  it("初期状態は編集対象なし", () => {
    const { result } = renderHook(() => useBudgetItemEditState());

    expect(result.current.editingItemId).toBeNull();
    expect(result.current.editingItemName).toBe("");
    expect(result.current.editingItemAmount).toBe("");
  });

  it("startEditItemで支出項目の名前・金額をセットする", () => {
    const { result } = renderHook(() => useBudgetItemEditState());

    act(() => {
      result.current.startEditItem(expenseItem);
    });

    expect(result.current.editingItemId).toBe("expense-1");
    expect(result.current.editingItemName).toBe("家賃");
    expect(result.current.editingItemAmount).toBe("80000");
  });

  it("startEditItemで収入項目の名前・金額をセットする", () => {
    const { result } = renderHook(() => useBudgetItemEditState());

    act(() => {
      result.current.startEditItem(incomeItem);
    });

    expect(result.current.editingItemId).toBe("income-1");
    expect(result.current.editingItemName).toBe("給与");
    expect(result.current.editingItemAmount).toBe("300000");
  });

  it("cancelEditItemで編集対象を解除する", () => {
    const { result } = renderHook(() => useBudgetItemEditState());

    act(() => {
      result.current.startEditItem(incomeItem);
    });
    act(() => {
      result.current.cancelEditItem();
    });

    expect(result.current.editingItemId).toBeNull();
  });

  it("setEditingItemName/setEditingItemAmountで入力値を更新できる", () => {
    const { result } = renderHook(() => useBudgetItemEditState());

    act(() => {
      result.current.startEditItem(incomeItem);
      result.current.setEditingItemName("本業給与");
      result.current.setEditingItemAmount("320000");
    });

    expect(result.current.editingItemName).toBe("本業給与");
    expect(result.current.editingItemAmount).toBe("320000");
  });
});
