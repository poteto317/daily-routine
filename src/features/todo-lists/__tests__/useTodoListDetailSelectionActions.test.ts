import { renderHook, act } from "@testing-library/react";
import { useTodoListDetailSelectionActions } from "../useTodoListDetailSelectionActions";
import { useTodoListDetailSelectedItemsState } from "../useTodoListDetailSelectedItemsState";

describe("useTodoListDetailSelectionActions", () => {
  describe("toggleSelectItem", () => {
    it("未選択アイテムを toggle すると setSelectedItemIds が updater 関数付きで呼ばれる", () => {
      const setSelectedItemIds = jest.fn();
      const { result } = renderHook(() =>
        useTodoListDetailSelectionActions({ setSelectedItemIds }),
      );

      result.current.toggleSelectItem("item-1");

      expect(setSelectedItemIds).toHaveBeenCalledTimes(1);
      const updater = setSelectedItemIds.mock.calls[0][0];
      const next = updater(new Set<string>());
      expect(next.has("item-1")).toBe(true);
    });

    it("選択済みアイテムを toggle すると updater が削除したSetを返す", () => {
      const setSelectedItemIds = jest.fn();
      const { result } = renderHook(() =>
        useTodoListDetailSelectionActions({ setSelectedItemIds }),
      );

      result.current.toggleSelectItem("item-1");

      const updater = setSelectedItemIds.mock.calls[0][0];
      const next = updater(new Set<string>(["item-1"]));
      expect(next.has("item-1")).toBe(false);
    });

    it("他のアイテムには影響しない", () => {
      const setSelectedItemIds = jest.fn();
      const { result } = renderHook(() =>
        useTodoListDetailSelectionActions({ setSelectedItemIds }),
      );

      result.current.toggleSelectItem("item-1");

      const updater = setSelectedItemIds.mock.calls[0][0];
      const prev = new Set<string>(["item-2"]);
      const next = updater(prev);
      expect(next.has("item-2")).toBe(true);
      expect(next.has("item-1")).toBe(true);
    });
  });

  describe("clearSelection", () => {
    it("clearSelection を呼ぶと setSelectedItemIds が空 Set で呼ばれる", () => {
      const setSelectedItemIds = jest.fn();
      const { result } = renderHook(() =>
        useTodoListDetailSelectionActions({ setSelectedItemIds }),
      );

      result.current.clearSelection();

      expect(setSelectedItemIds).toHaveBeenCalledWith(new Set());
    });
  });

  describe("実際の state との統合", () => {
    it("toggleSelectItem と clearSelection が state を正しく更新する", () => {
      const { result } = renderHook(() => {
        const { selectedItemIds, setSelectedItemIds } =
          useTodoListDetailSelectedItemsState();
        const actions = useTodoListDetailSelectionActions({
          setSelectedItemIds,
        });
        return { selectedItemIds, ...actions };
      });

      act(() => {
        result.current.toggleSelectItem("item-1");
        result.current.toggleSelectItem("item-2");
      });

      expect(result.current.selectedItemIds.has("item-1")).toBe(true);
      expect(result.current.selectedItemIds.has("item-2")).toBe(true);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedItemIds.size).toBe(0);
    });

    it("選択後に同じアイテムを再 toggle すると選択解除される", () => {
      const { result } = renderHook(() => {
        const { selectedItemIds, setSelectedItemIds } =
          useTodoListDetailSelectedItemsState();
        const actions = useTodoListDetailSelectionActions({
          setSelectedItemIds,
        });
        return { selectedItemIds, ...actions };
      });

      act(() => {
        result.current.toggleSelectItem("item-1");
      });
      act(() => {
        result.current.toggleSelectItem("item-1");
      });

      expect(result.current.selectedItemIds.has("item-1")).toBe(false);
    });
  });

  describe("参照安定性", () => {
    it("toggleSelectItem の参照はレンダリング間で安定している", () => {
      const setSelectedItemIds = jest.fn();
      const { result, rerender } = renderHook(() =>
        useTodoListDetailSelectionActions({ setSelectedItemIds }),
      );

      const toggleRef = result.current.toggleSelectItem;
      rerender();

      expect(result.current.toggleSelectItem).toBe(toggleRef);
    });

    it("clearSelection の参照はレンダリング間で安定している", () => {
      const setSelectedItemIds = jest.fn();
      const { result, rerender } = renderHook(() =>
        useTodoListDetailSelectionActions({ setSelectedItemIds }),
      );

      const clearRef = result.current.clearSelection;
      rerender();

      expect(result.current.clearSelection).toBe(clearRef);
    });
  });
});
