import { act, renderHook } from "@testing-library/react";
import { useTodoListDetailViewState } from "../useTodoListDetailViewState";

describe("useTodoListDetailViewState", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [
      {
        id: "item-1",
        title: "Task 1",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
      {
        id: "item-2",
        title: "Done Task",
        isCompleted: true,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("list.hideCompleted に応じて可視アイテムをフィルタする", () => {
    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list: { ...list, hideCompleted: true },
        onAddItem: jest.fn(),
        onUpdateItemTitle: jest.fn(),
        onUpdateListTitle: jest.fn(),
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(result.current.hideCompleted).toBe(true);
    expect(result.current.visibleItems).toEqual([
      expect.objectContaining({ id: "item-1" }),
    ]);
  });

  it("toggleHideCompleted は onUpdateListHideCompleted をリストIDと反転値付きで呼ぶ", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list,
        onAddItem: jest.fn(),
        onUpdateItemTitle: jest.fn(),
        onUpdateListTitle: jest.fn(),
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted,
      }),
    );

    expect(result.current.visibleItems).toHaveLength(2);

    act(() => {
      result.current.toggleHideCompleted();
    });

    expect(onUpdateListHideCompleted).toHaveBeenCalledWith("list-1", true);
  });

  it("アイテム編集状態を管理し、確定時に更新を通知する", () => {
    const onUpdateItemTitle = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list,
        onAddItem: jest.fn(),
        onUpdateItemTitle,
        onUpdateListTitle: jest.fn(),
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    act(() => {
      result.current.startEditItem("item-1", "Task 1");
    });

    expect(result.current.editingItemId).toBe("item-1");
    expect(result.current.editingItemTitle).toBe("Task 1");

    act(() => {
      result.current.setEditingItemTitle("Updated Task");
    });

    act(() => {
      result.current.commitEditItem("item-1");
    });

    expect(onUpdateItemTitle).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "Updated Task",
    );
    expect(result.current.editingItemId).toBeNull();
  });

  it("リスト名編集状態を管理し、確定時に更新を通知する", () => {
    const onUpdateListTitle = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list,
        onAddItem: jest.fn(),
        onUpdateItemTitle: jest.fn(),
        onUpdateListTitle,
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    act(() => {
      result.current.startEditListTitle();
      jest.runOnlyPendingTimers();
    });

    expect(result.current.editingListTitle).toBe(true);
    expect(result.current.editingListTitleValue).toBe("Inbox");

    act(() => {
      result.current.setEditingListTitleValue("Work");
    });

    act(() => {
      result.current.commitEditListTitle();
    });

    expect(onUpdateListTitle).toHaveBeenCalledWith("list-1", "Work");
    expect(result.current.editingListTitle).toBe(false);
  });

  it("Todo追加入力を処理し、成功時に入力をリセットする", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list,
        onAddItem,
        onUpdateItemTitle: jest.fn(),
        onUpdateListTitle: jest.fn(),
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    act(() => {
      result.current.setInputText(" New Task ");
    });

    let didAdd = false;
    act(() => {
      didAdd = result.current.handleAdd();
    });

    expect(didAdd).toBe(true);
    expect(onAddItem).toHaveBeenCalledWith("list-1", "New Task");
    expect(result.current.inputText).toBe("");
  });

  it("空入力ではTodo追加しない", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list,
        onAddItem,
        onUpdateItemTitle: jest.fn(),
        onUpdateListTitle: jest.fn(),
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    act(() => {
      result.current.setInputText("   ");
    });

    let didAdd = true;
    act(() => {
      didAdd = result.current.handleAdd();
    });

    expect(didAdd).toBe(false);
    expect(onAddItem).not.toHaveBeenCalled();
  });
});
