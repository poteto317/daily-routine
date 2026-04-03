import { renderHook } from "@testing-library/react";
import { useTodoListDetailPasteAction } from "../useTodoListDetailPasteAction";
import type { TodoListItem } from "../types";

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("useTodoListDetailPasteAction", () => {
  it("handlePaste を呼ぶと onPasteItems・onClearClipboard が呼ばれる", () => {
    const clipboardItems = [createItem({ id: "a" })];
    const onPasteItems = jest.fn();
    const onClearClipboard = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailPasteAction({
        listId: "list-1",
        clipboardItems,
        onPasteItems,
        onClearClipboard,
      }),
    );

    result.current.handlePaste();

    expect(onPasteItems).toHaveBeenCalledWith("list-1", clipboardItems);
    expect(onClearClipboard).toHaveBeenCalledTimes(1);
  });

  it("clipboardItems が空の場合は何も呼ばれない", () => {
    const onPasteItems = jest.fn();
    const onClearClipboard = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailPasteAction({
        listId: "list-1",
        clipboardItems: [],
        onPasteItems,
        onClearClipboard,
      }),
    );

    result.current.handlePaste();

    expect(onPasteItems).not.toHaveBeenCalled();
    expect(onClearClipboard).not.toHaveBeenCalled();
  });

  it("複数アイテムを正しく渡す", () => {
    const clipboardItems = [
      createItem({ id: "a" }),
      createItem({ id: "b" }),
      createItem({ id: "c" }),
    ];
    const onPasteItems = jest.fn();
    const onClearClipboard = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailPasteAction({
        listId: "list-1",
        clipboardItems,
        onPasteItems,
        onClearClipboard,
      }),
    );

    result.current.handlePaste();

    expect(onPasteItems).toHaveBeenCalledWith("list-1", clipboardItems);
    expect(clipboardItems).toHaveLength(3);
  });

  it("listId を正しく渡す", () => {
    const clipboardItems = [createItem()];
    const onPasteItems = jest.fn();
    const onClearClipboard = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailPasteAction({
        listId: "target-list",
        clipboardItems,
        onPasteItems,
        onClearClipboard,
      }),
    );

    result.current.handlePaste();

    expect(onPasteItems).toHaveBeenCalledWith("target-list", expect.anything());
  });

  it("依存値が変わらなければ handlePaste の参照はレンダリング間で安定している", () => {
    const clipboardItems = [createItem()];
    const onPasteItems = jest.fn();
    const onClearClipboard = jest.fn();

    const { result, rerender } = renderHook(() =>
      useTodoListDetailPasteAction({
        listId: "list-1",
        clipboardItems,
        onPasteItems,
        onClearClipboard,
      }),
    );

    const handlePasteRef = result.current.handlePaste;
    rerender();

    expect(result.current.handlePaste).toBe(handlePasteRef);
  });
});
