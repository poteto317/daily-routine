import { act, renderHook } from "@testing-library/react";
import { useTodoListInlineInsert } from "../useTodoListInlineInsert";

describe("useTodoListInlineInsert", () => {
  const listId = "list-1";

  it("初期状態は null / 空文字", () => {
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem: jest.fn() }),
    );

    expect(result.current.insertAfterId).toBeNull();
    expect(result.current.inlineInputText).toBe("");
  });

  it("openInlineInsert を呼ぶと insertAfterId がセットされ入力がクリアされる", () => {
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem: jest.fn() }),
    );

    act(() => {
      result.current.setInlineInputText("入力中");
    });
    act(() => {
      result.current.openInlineInsert("item-42");
    });

    expect(result.current.insertAfterId).toBe("item-42");
    expect(result.current.inlineInputText).toBe("");
  });

  it("openInlineInsert を同じアイテムIDで再度呼ぶとトグルして閉じ、入力もクリアされる", () => {
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem: jest.fn() }),
    );

    act(() => {
      result.current.openInlineInsert("item-42");
      result.current.setInlineInputText("入力中");
    });
    act(() => {
      result.current.openInlineInsert("item-42");
    });

    expect(result.current.insertAfterId).toBeNull();
    expect(result.current.inlineInputText).toBe("");
  });

  it("closeInlineInsert を呼ぶと insertAfterId と入力がリセットされる", () => {
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem: jest.fn() }),
    );

    act(() => {
      result.current.openInlineInsert("item-1");
      result.current.setInlineInputText("テスト");
    });
    act(() => {
      result.current.closeInlineInsert();
    });

    expect(result.current.insertAfterId).toBeNull();
    expect(result.current.inlineInputText).toBe("");
  });

  it("handleInlineAdd は空文字のとき onAddItem を呼ばない", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem }),
    );

    act(() => {
      result.current.handleInlineAdd(0);
    });

    expect(onAddItem).not.toHaveBeenCalled();
  });

  it("handleInlineAdd は空白のみのとき onAddItem を呼ばない", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem }),
    );

    act(() => {
      result.current.setInlineInputText("   ");
    });
    act(() => {
      result.current.handleInlineAdd(2);
    });

    expect(onAddItem).not.toHaveBeenCalled();
  });

  it("handleInlineAdd は有効なテキストのとき onAddItem を呼んで状態をリセットする", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListInlineInsert({ listId, onAddItem }),
    );

    act(() => {
      result.current.openInlineInsert("item-5");
      result.current.setInlineInputText("  新しいTodo  ");
    });
    act(() => {
      result.current.handleInlineAdd(3);
    });

    expect(onAddItem).toHaveBeenCalledWith("list-1", "新しいTodo", 3);
    expect(result.current.insertAfterId).toBeNull();
    expect(result.current.inlineInputText).toBe("");
  });
});
