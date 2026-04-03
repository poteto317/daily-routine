import { renderHook, act } from "@testing-library/react";
import { useTodoListDetailClipboardState } from "../useTodoListDetailClipboardState";
import type { TodoListItem } from "../types";

const makeItem = (id: string): TodoListItem => ({
  id,
  title: `item-${id}`,
  isCompleted: false,
  createdAt: "2024-01-01T00:00:00.000Z",
});

describe("useTodoListDetailClipboardState", () => {
  it("初期状態では clipboardItems が空配列", () => {
    const { result } = renderHook(() => useTodoListDetailClipboardState());

    expect(result.current.clipboardItems).toHaveLength(0);
  });

  it("setClipboardItems でアイテムが格納される", () => {
    const { result } = renderHook(() => useTodoListDetailClipboardState());
    const items = [makeItem("a"), makeItem("b")];

    act(() => {
      result.current.setClipboardItems(items);
    });

    expect(result.current.clipboardItems).toHaveLength(2);
    expect(result.current.clipboardItems[0].id).toBe("a");
    expect(result.current.clipboardItems[1].id).toBe("b");
  });

  it("空配列を set するとクリップボードがクリアされる", () => {
    const { result } = renderHook(() => useTodoListDetailClipboardState());

    act(() => {
      result.current.setClipboardItems([makeItem("a")]);
    });
    act(() => {
      result.current.setClipboardItems([]);
    });

    expect(result.current.clipboardItems).toHaveLength(0);
  });

  it("setClipboardItems は既存アイテムを上書きする", () => {
    const { result } = renderHook(() => useTodoListDetailClipboardState());

    act(() => {
      result.current.setClipboardItems([makeItem("a"), makeItem("b")]);
    });
    act(() => {
      result.current.setClipboardItems([makeItem("c")]);
    });

    expect(result.current.clipboardItems).toHaveLength(1);
    expect(result.current.clipboardItems[0].id).toBe("c");
  });
});
