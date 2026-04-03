import { renderHook, act } from "@testing-library/react";
import { useTodoListDetailClipboard } from "../useTodoListDetailClipboard";
import type { TodoListItem } from "../types";

const makeItem = (id: string): TodoListItem => ({
  id,
  title: `item-${id}`,
  isCompleted: false,
  createdAt: "2024-01-01T00:00:00.000Z",
});

describe("useTodoListDetailClipboard", () => {
  it("初期状態では clipboardItems が空配列", () => {
    const { result } = renderHook(() => useTodoListDetailClipboard());

    expect(result.current.clipboardItems).toHaveLength(0);
  });

  it("setClipboard でアイテムが格納される", () => {
    const { result } = renderHook(() => useTodoListDetailClipboard());
    const items = [makeItem("a"), makeItem("b")];

    act(() => {
      result.current.setClipboard(items);
    });

    expect(result.current.clipboardItems).toHaveLength(2);
    expect(result.current.clipboardItems[0].id).toBe("a");
    expect(result.current.clipboardItems[1].id).toBe("b");
  });

  it("clearClipboard を呼ぶと clipboardItems が空になる", () => {
    const { result } = renderHook(() => useTodoListDetailClipboard());

    act(() => {
      result.current.setClipboard([makeItem("a"), makeItem("b")]);
    });
    act(() => {
      result.current.clearClipboard();
    });

    expect(result.current.clipboardItems).toHaveLength(0);
  });

  it("setClipboard は既存アイテムを上書きする", () => {
    const { result } = renderHook(() => useTodoListDetailClipboard());

    act(() => {
      result.current.setClipboard([makeItem("a"), makeItem("b")]);
    });
    act(() => {
      result.current.setClipboard([makeItem("c")]);
    });

    expect(result.current.clipboardItems).toHaveLength(1);
    expect(result.current.clipboardItems[0].id).toBe("c");
  });

  it("clearClipboard の参照はレンダリング間で安定している", () => {
    const { result, rerender } = renderHook(() => useTodoListDetailClipboard());

    const clearClipboardRef = result.current.clearClipboard;
    rerender();

    expect(result.current.clearClipboard).toBe(clearClipboardRef);
  });

  it("setClipboard の参照はレンダリング間で安定している", () => {
    const { result, rerender } = renderHook(() => useTodoListDetailClipboard());

    const setClipboardRef = result.current.setClipboard;
    rerender();

    expect(result.current.setClipboard).toBe(setClipboardRef);
  });
});
