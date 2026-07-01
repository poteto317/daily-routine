import { renderHook, act } from "@testing-library/react";
import { useTodoListDetailSelection } from "../useTodoListDetailSelection";
import type { TodoListItem } from "../types";

const makeItem = (id: string): TodoListItem => ({
  id,
  title: `item-${id}`,
  isCompleted: false,
  createdAt: "2024-01-01T00:00:00.000Z",
});

const makeParams = (
  overrides: Partial<Parameters<typeof useTodoListDetailSelection>[0]> = {},
) => ({
  listId: "list-1",
  clipboardItems: [],
  onCutItems: jest.fn().mockReturnValue([]),
  onPasteItems: jest.fn(),
  onSetClipboard: jest.fn(),
  onClearClipboard: jest.fn(),
  ...overrides,
});

describe("useTodoListDetailSelection", () => {
  describe("初期状態", () => {
    it("selectedItemIds が空で hasSelection が false", () => {
      const { result } = renderHook(() =>
        useTodoListDetailSelection(makeParams()),
      );

      expect(result.current.selectedItemIds.size).toBe(0);
      expect(result.current.hasSelection).toBe(false);
    });
  });


  describe("選択操作", () => {
    it("toggleSelectItem でアイテムが選択される", () => {
      const { result } = renderHook(() =>
        useTodoListDetailSelection(makeParams()),
      );

      act(() => {
        result.current.toggleSelectItem("item-1");
      });

      expect(result.current.selectedItemIds.has("item-1")).toBe(true);
      expect(result.current.hasSelection).toBe(true);
    });

    it("clearSelection で全選択が解除される", () => {
      const { result } = renderHook(() =>
        useTodoListDetailSelection(makeParams()),
      );

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
  });

  describe("カット操作", () => {
    it("handleCut を呼ぶと onCutItems・onSetClipboard・clearSelection が連動する", () => {
      const cutItems = [makeItem("a")];
      const onCutItems = jest.fn().mockReturnValue(cutItems);
      const onSetClipboard = jest.fn();

      const { result } = renderHook(() =>
        useTodoListDetailSelection(makeParams({ onCutItems, onSetClipboard })),
      );

      act(() => {
        result.current.toggleSelectItem("item-a");
      });
      act(() => {
        result.current.handleCut();
      });

      expect(onCutItems).toHaveBeenCalledWith("list-1", expect.any(Set));
      expect(onSetClipboard).toHaveBeenCalledWith(cutItems);
      // カット後は選択がクリアされる
      expect(result.current.selectedItemIds.size).toBe(0);
    });

    it("複数アイテム選択後の handleCut で全選択済み ID が Set ごと onCutItems に渡る", () => {
      const cutItems = [makeItem("x"), makeItem("y"), makeItem("z")];
      const onCutItems = jest.fn().mockReturnValue(cutItems);
      const onSetClipboard = jest.fn();

      const { result } = renderHook(() =>
        useTodoListDetailSelection(makeParams({ onCutItems, onSetClipboard })),
      );

      act(() => {
        result.current.toggleSelectItem("x");
        result.current.toggleSelectItem("y");
        result.current.toggleSelectItem("z");
      });
      act(() => {
        result.current.handleCut();
      });

      const passedSet: Set<string> = (onCutItems as jest.Mock).mock.calls[0][1];
      expect(passedSet.has("x")).toBe(true);
      expect(passedSet.has("y")).toBe(true);
      expect(passedSet.has("z")).toBe(true);
      expect(passedSet.size).toBe(3);
      expect(onSetClipboard).toHaveBeenCalledWith(cutItems);
      expect(result.current.selectedItemIds.size).toBe(0);
    });

    it("選択なしで handleCut を呼んでも何も起きない", () => {
      const onCutItems = jest.fn();
      const onSetClipboard = jest.fn();

      const { result } = renderHook(() =>
        useTodoListDetailSelection(makeParams({ onCutItems, onSetClipboard })),
      );

      act(() => {
        result.current.handleCut();
      });

      expect(onCutItems).not.toHaveBeenCalled();
      expect(onSetClipboard).not.toHaveBeenCalled();
    });
  });

  describe("ペースト操作", () => {
    it("handlePaste を呼ぶと onPasteItems・onClearClipboard が連動する", () => {
      const clipboardItems = [makeItem("a"), makeItem("b")];
      const onPasteItems = jest.fn();
      const onClearClipboard = jest.fn();

      const { result } = renderHook(() =>
        useTodoListDetailSelection(
          makeParams({ clipboardItems, onPasteItems, onClearClipboard }),
        ),
      );

      act(() => {
        result.current.handlePaste();
      });

      expect(onPasteItems).toHaveBeenCalledWith("list-1", clipboardItems);
      expect(onClearClipboard).toHaveBeenCalledTimes(1);
    });

    it("clipboardItems が空のとき handlePaste を呼んでも何も起きない", () => {
      const onPasteItems = jest.fn();
      const onClearClipboard = jest.fn();

      const { result } = renderHook(() =>
        useTodoListDetailSelection(
          makeParams({
            clipboardItems: [],
            onPasteItems,
            onClearClipboard,
          }),
        ),
      );

      act(() => {
        result.current.handlePaste();
      });

      expect(onPasteItems).not.toHaveBeenCalled();
      expect(onClearClipboard).not.toHaveBeenCalled();
    });
  });
});
