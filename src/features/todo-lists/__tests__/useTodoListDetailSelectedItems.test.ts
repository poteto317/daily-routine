import { renderHook, act } from "@testing-library/react";
import { useTodoListDetailSelectedItems } from "../useTodoListDetailSelectedItems";

describe("useTodoListDetailSelectedItems", () => {
  it("初期状態では selectedItemIds が空で hasSelection が false", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    expect(result.current.selectedItemIds.size).toBe(0);
    expect(result.current.hasSelection).toBe(false);
  });

  it("toggleSelectItem でアイテムが選択される", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    act(() => {
      result.current.toggleSelectItem("item-1");
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(true);
    expect(result.current.hasSelection).toBe(true);
  });

  it("同じアイテムを再度 toggle すると選択解除される", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    act(() => {
      result.current.toggleSelectItem("item-1");
    });
    act(() => {
      result.current.toggleSelectItem("item-1");
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  });

  it("複数アイテムを独立して選択できる", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    act(() => {
      result.current.toggleSelectItem("item-1");
      result.current.toggleSelectItem("item-2");
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(true);
    expect(result.current.selectedItemIds.has("item-2")).toBe(true);
    expect(result.current.selectedItemIds.size).toBe(2);
  });

  it("clearSelection で全選択が解除される", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    act(() => {
      result.current.toggleSelectItem("item-1");
      result.current.toggleSelectItem("item-2");
    });
    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedItemIds.size).toBe(0);
    expect(result.current.hasSelection).toBe(false);
  });

  it("clearSelection 後も toggleSelectItem で再選択できる", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    act(() => {
      result.current.toggleSelectItem("item-1");
    });
    act(() => {
      result.current.clearSelection();
    });
    act(() => {
      result.current.toggleSelectItem("item-2");
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(false);
    expect(result.current.selectedItemIds.has("item-2")).toBe(true);
    expect(result.current.hasSelection).toBe(true);
  });

  it("toggleSelectItem は既存選択を維持しながら追加・解除する", () => {
    const { result } = renderHook(() => useTodoListDetailSelectedItems());

    act(() => {
      result.current.toggleSelectItem("item-1");
    });
    act(() => {
      result.current.toggleSelectItem("item-2");
    });
    act(() => {
      result.current.toggleSelectItem("item-1");
    });

    expect(result.current.selectedItemIds.has("item-1")).toBe(false);
    expect(result.current.selectedItemIds.has("item-2")).toBe(true);
  });

  describe("参照安定性", () => {
    it("toggleSelectItem の参照はレンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useTodoListDetailSelectedItems(),
      );

      const toggleRef = result.current.toggleSelectItem;
      rerender();

      expect(result.current.toggleSelectItem).toBe(toggleRef);
    });

    it("clearSelection の参照はレンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useTodoListDetailSelectedItems(),
      );

      const clearRef = result.current.clearSelection;
      rerender();

      expect(result.current.clearSelection).toBe(clearRef);
    });
  });
});
