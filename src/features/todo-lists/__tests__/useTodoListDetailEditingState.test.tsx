import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailEditingStateResult", () => ({
  createTodoListDetailEditingStateResult: jest.fn(),
}));

jest.mock("../useTodoListDetailItemEditing", () => ({
  useTodoListDetailItemEditing: jest.fn(),
}));

jest.mock("../useTodoListDetailTitleEditing", () => ({
  useTodoListDetailTitleEditing: jest.fn(),
}));

import { useTodoListDetailEditingState } from "../useTodoListDetailEditingState";
import { createTodoListDetailEditingStateResult } from "../todoListDetailEditingStateResult";
import { useTodoListDetailItemEditing } from "../useTodoListDetailItemEditing";
import { useTodoListDetailTitleEditing } from "../useTodoListDetailTitleEditing";

describe("useTodoListDetailEditingState", () => {
  const itemEditing = {
    editingItemId: "item-1",
    editingItemTitle: "Task 1",
    setEditingItemTitle: jest.fn(),
    startEditItem: jest.fn(),
    cancelEditItem: jest.fn(),
    commitEditItem: jest.fn(),
  };
  const titleEditing = {
    editingListTitle: true,
    editingListTitleValue: "Inbox",
    setEditingListTitleValue: jest.fn(),
    startEditListTitle: jest.fn(),
    cancelEditListTitle: jest.fn(),
    commitEditListTitle: jest.fn(),
    listTitleInputRef: { current: null },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailItemEditing as jest.Mock).mockReturnValue(itemEditing);
    (useTodoListDetailTitleEditing as jest.Mock).mockReturnValue(titleEditing);
  });

  it("item/title editing hook をまとめて返す", () => {
    const onUpdateItemTitle = jest.fn();
    const onUpdateListTitle = jest.fn();
    const editingStateResult = {
      ...itemEditing,
      ...titleEditing,
    };
    (createTodoListDetailEditingStateResult as jest.Mock).mockReturnValue(
      editingStateResult,
    );

    const { result } = renderHook(() =>
      useTodoListDetailEditingState({
        listId: "list-1",
        listTitle: "Inbox",
        onUpdateItemTitle,
        onUpdateListTitle,
      }),
    );

    expect(useTodoListDetailItemEditing).toHaveBeenCalledWith({
      listId: "list-1",
      onUpdateItemTitle,
    });
    expect(useTodoListDetailTitleEditing).toHaveBeenCalledWith({
      listId: "list-1",
      listTitle: "Inbox",
      onUpdateListTitle,
    });
    expect(createTodoListDetailEditingStateResult).toHaveBeenCalledWith({
      itemEditing,
      titleEditing,
    });
    expect(result.current).toBe(editingStateResult);
  });
});
