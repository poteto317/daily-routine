import { act, renderHook } from "@testing-library/react";
import { useBudgetExpenseItemEditState } from "../useBudgetExpenseItemEditState";

const item = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetExpenseItemEditState", () => {
  it("初期状態は編集対象なし", () => {
    const { result } = renderHook(() => useBudgetExpenseItemEditState());

    expect(result.current.editingItemId).toBeNull();
    expect(result.current.editingItemName).toBe("");
    expect(result.current.editingItemAmount).toBe("");
  });

  it("startEditItemで対象アイテムの名前・金額をセットする", () => {
    const { result } = renderHook(() => useBudgetExpenseItemEditState());

    act(() => {
      result.current.startEditItem(item);
    });

    expect(result.current.editingItemId).toBe("expense-1");
    expect(result.current.editingItemName).toBe("家賃");
    expect(result.current.editingItemAmount).toBe("80000");
  });

  it("cancelEditItemで編集対象を解除する", () => {
    const { result } = renderHook(() => useBudgetExpenseItemEditState());

    act(() => {
      result.current.startEditItem(item);
    });
    act(() => {
      result.current.cancelEditItem();
    });

    expect(result.current.editingItemId).toBeNull();
  });
});
