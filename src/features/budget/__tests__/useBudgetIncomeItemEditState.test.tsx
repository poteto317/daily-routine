import { act, renderHook } from "@testing-library/react";
import { useBudgetIncomeItemEditState } from "../useBudgetIncomeItemEditState";

const item = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetIncomeItemEditState", () => {
  it("初期状態は編集対象なし", () => {
    const { result } = renderHook(() => useBudgetIncomeItemEditState());

    expect(result.current.editingItemId).toBeNull();
    expect(result.current.editingItemName).toBe("");
    expect(result.current.editingItemAmount).toBe("");
  });

  it("startEditItemで対象アイテムの名前・金額をセットする", () => {
    const { result } = renderHook(() => useBudgetIncomeItemEditState());

    act(() => {
      result.current.startEditItem(item);
    });

    expect(result.current.editingItemId).toBe("income-1");
    expect(result.current.editingItemName).toBe("給与");
    expect(result.current.editingItemAmount).toBe("300000");
  });

  it("cancelEditItemで編集対象を解除する", () => {
    const { result } = renderHook(() => useBudgetIncomeItemEditState());

    act(() => {
      result.current.startEditItem(item);
    });
    act(() => {
      result.current.cancelEditItem();
    });

    expect(result.current.editingItemId).toBeNull();
  });

  it("setEditingItemName/setEditingItemAmountで入力値を更新できる", () => {
    const { result } = renderHook(() => useBudgetIncomeItemEditState());

    act(() => {
      result.current.startEditItem(item);
      result.current.setEditingItemName("本業給与");
      result.current.setEditingItemAmount("320000");
    });

    expect(result.current.editingItemName).toBe("本業給与");
    expect(result.current.editingItemAmount).toBe("320000");
  });
});
