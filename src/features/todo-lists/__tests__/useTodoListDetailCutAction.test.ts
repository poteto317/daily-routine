import { renderHook } from "@testing-library/react";
import { useTodoListDetailCutAction } from "../useTodoListDetailCutAction";
import type { TodoListItem } from "../types";

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("useTodoListDetailCutAction", () => {
  it("handleCut を呼ぶと onCutItems・onSetClipboard・clearSelection が呼ばれる", () => {
    const cutItems = [createItem({ id: "a" })];
    const onCutItems = jest.fn().mockReturnValue(cutItems);
    const onSetClipboard = jest.fn();
    const clearSelection = jest.fn();
    const selectedItemIds = new Set(["a"]);

    const { result } = renderHook(() =>
      useTodoListDetailCutAction({
        listId: "list-1",
        selectedItemIds,
        clearSelection,
        onCutItems,
        onSetClipboard,
      }),
    );

    result.current.handleCut();

    expect(onCutItems).toHaveBeenCalledWith("list-1", selectedItemIds);
    expect(onSetClipboard).toHaveBeenCalledWith(cutItems);
    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it("selectedItemIds が空の場合は何も呼ばれない", () => {
    const onCutItems = jest.fn();
    const onSetClipboard = jest.fn();
    const clearSelection = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailCutAction({
        listId: "list-1",
        selectedItemIds: new Set(),
        clearSelection,
        onCutItems,
        onSetClipboard,
      }),
    );

    result.current.handleCut();

    expect(onCutItems).not.toHaveBeenCalled();
    expect(onSetClipboard).not.toHaveBeenCalled();
    expect(clearSelection).not.toHaveBeenCalled();
  });

  it("onCutItems が空配列を返してもクリップボードに空配列をセットする", () => {
    const onCutItems = jest.fn().mockReturnValue([]);
    const onSetClipboard = jest.fn();
    const clearSelection = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailCutAction({
        listId: "list-1",
        selectedItemIds: new Set(["nonexistent"]),
        clearSelection,
        onCutItems,
        onSetClipboard,
      }),
    );

    result.current.handleCut();

    expect(onSetClipboard).toHaveBeenCalledWith([]);
    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it("依存値が変わらなければ handleCut の参照はレンダリング間で安定している", () => {
    const onCutItems = jest.fn();
    const onSetClipboard = jest.fn();
    const clearSelection = jest.fn();
    const selectedItemIds = new Set(["a"]);

    const { result, rerender } = renderHook(() =>
      useTodoListDetailCutAction({
        listId: "list-1",
        selectedItemIds,
        clearSelection,
        onCutItems,
        onSetClipboard,
      }),
    );

    const handleCutRef = result.current.handleCut;
    rerender();

    expect(result.current.handleCut).toBe(handleCutRef);
  });
});
