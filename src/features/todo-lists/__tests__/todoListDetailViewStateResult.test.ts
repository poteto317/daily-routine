import { createTodoListDetailViewStateResult } from "../todoListDetailViewStateResult";

describe("createTodoListDetailViewStateResult", () => {
  it("form/computed/editing の公開 shape を返す", () => {
    const detailForm = {
      inputText: "",
      dragOverIndex: null,
      inputRef: { current: null },
      setInputText: jest.fn(),
      setDragOverIndex: jest.fn(),
      handleAdd: jest.fn(),
    };
    const detailComputed = {
      collapsedItemIds: new Set<string>(),
      hideCompleted: false,
      moveCompletedToBottom: false,
      progress: { completed: 0, total: 0, percentage: 0 },
      toggleCollapseItem: jest.fn(),
      toggleHideCompleted: jest.fn(),
      toggleMoveCompletedToBottom: jest.fn(),
      visibleItems: [] as never[],
    };
    const detailEditing = {
      editingItemId: null,
      editingItemTitle: "",
      editingListTitle: false,
      editingListTitleValue: "Inbox",
      setEditingItemId: jest.fn(),
      setEditingItemTitle: jest.fn(),
      setEditingListTitleValue: jest.fn(),
      cancelEditItem: jest.fn(),
      commitEditItem: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditListTitle: jest.fn(),
      commitEditListTitle: jest.fn(),
      startEditListTitle: jest.fn(),
      listTitleInputRef: { current: null },
    };

    const result = createTodoListDetailViewStateResult({
      detailForm,
      detailComputed,
      detailEditing,
    });

    expect(result).toEqual({
      ...detailForm,
      ...detailComputed,
      ...detailEditing,
    });
  });
});
