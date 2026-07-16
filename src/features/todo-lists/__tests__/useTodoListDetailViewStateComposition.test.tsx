import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailViewStateResult", () => ({
  createTodoListDetailViewStateResult: jest.fn(),
}));

jest.mock("../useTodoListDetailComputedState", () => ({
  useTodoListDetailComputedState: jest.fn(),
}));

jest.mock("../useTodoListDetailEditingState", () => ({
  useTodoListDetailEditingState: jest.fn(),
}));

jest.mock("../useTodoListDetailFormState", () => ({
  useTodoListDetailFormState: jest.fn(),
}));

import { useTodoListDetailComputedState } from "../useTodoListDetailComputedState";
import { useTodoListDetailEditingState } from "../useTodoListDetailEditingState";
import { useTodoListDetailFormState } from "../useTodoListDetailFormState";
import { createTodoListDetailViewStateResult } from "../todoListDetailViewStateResult";
import { useTodoListDetailViewState } from "../useTodoListDetailViewState";

describe("useTodoListDetailViewState composition", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const detailForm = {
      inputText: "",
      dragOverIndex: null,
      inputRef: { current: null },
      setInputText: jest.fn(),
      setDragOverIndex: jest.fn(),
      handleAdd: jest.fn(),
    };
    const detailComputed = {
      hideCompleted: false,
      progress: 0,
      visibleItems: [],
      toggleHideCompleted: jest.fn(),
    };
    const detailEditing = {
      editingItemId: null,
      editingListTitle: false,
      startEditItem: jest.fn(),
      startEditListTitle: jest.fn(),
    };
    (useTodoListDetailFormState as jest.Mock).mockReturnValue(detailForm);
    (useTodoListDetailComputedState as jest.Mock).mockReturnValue(
      detailComputed,
    );
    (useTodoListDetailEditingState as jest.Mock).mockReturnValue(detailEditing);
    (createTodoListDetailViewStateResult as jest.Mock).mockReturnValue({
      ...detailForm,
      ...detailComputed,
      ...detailEditing,
    });
  });

  it("form/computed/editing hook を compose する", () => {
    const onAddItem = jest.fn();
    const onUpdateItemTitle = jest.fn();
    const onUpdateListTitle = jest.fn();
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const onUpdateListHideCompleted = jest.fn();
    const onUpdateListGroupByCategory = jest.fn();
    const categories: never[] = [];

    const { result } = renderHook(() =>
      useTodoListDetailViewState({
        list,
        categories,
        onAddItem,
        onUpdateItemTitle,
        onUpdateListTitle,
        onUpdateListMoveCompletedToBottom,
        onUpdateListHideCompleted,
        onUpdateListGroupByCategory,
      }),
    );

    expect(useTodoListDetailFormState).toHaveBeenCalledWith({
      listId: "list-1",
      onAddItem,
    });
    expect(useTodoListDetailComputedState).toHaveBeenCalledWith({
      list,
      categories,
      onUpdateListMoveCompletedToBottom,
      onUpdateListHideCompleted,
      onUpdateListGroupByCategory,
    });
    expect(useTodoListDetailEditingState).toHaveBeenCalledWith({
      listId: "list-1",
      listTitle: "Inbox",
      onUpdateItemTitle,
      onUpdateListTitle,
    });
    expect(createTodoListDetailViewStateResult).toHaveBeenCalledWith({
      detailForm: expect.objectContaining({
        inputText: "",
      }),
      detailComputed: expect.objectContaining({
        hideCompleted: false,
      }),
      detailEditing: expect.objectContaining({
        editingItemId: null,
        editingListTitle: false,
      }),
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        inputText: "",
        hideCompleted: false,
        editingItemId: null,
        editingListTitle: false,
      }),
    );
  });
});
