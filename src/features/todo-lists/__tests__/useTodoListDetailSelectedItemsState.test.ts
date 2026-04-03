import { renderHook, act } from "@testing-library/react";
import { useTodoListDetailSelectedItemsState } from "../useTodoListDetailSelectedItemsState";

describe("useTodoListDetailSelectedItemsState", () => {
  it("初期状態では selectedItemIds が空", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItemsState());

    expect(result.current.selectedItemIds.size).toBe(0);
  });

  it("setSelectedItemIds で Set を直接渡すと状態が更新される", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItemsState());

    act(() => {
      result.current.setSelectedItemIds(new Set(["item-1"]));
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(true);
  });

  it("setSelectedItemIds にアップデーター関数を渡すと前の状態を元に更新される", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItemsState());

    act(() => {
      result.current.setSelectedItemIds(new Set(["item-1"]));
    });
    act(() => {
      result.current.setSelectedItemIds((prev) => {
        const next = new Set(prev);
        next.add("item-2");
        return next;
      });
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(true);
    expect(result.current.selectedItemIds.has("item-2")).toBe(true);
  });

  it("setSelectedItemIds で空 Set を渡すと状態がリセットされる", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItemsState());

    act(() => {
      result.current.setSelectedItemIds(new Set(["item-1", "item-2"]));
    });
    act(() => {
      result.current.setSelectedItemIds(new Set());
    });

    expect(result.current.selectedItemIds.size).toBe(0);
  });
});
