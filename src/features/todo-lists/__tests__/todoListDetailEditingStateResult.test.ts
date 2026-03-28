import { createTodoListDetailEditingStateResult } from "../todoListDetailEditingStateResult";

describe("createTodoListDetailEditingStateResult", () => {
  it("item と title editing の公開 shape をまとめて返す", () => {
    const itemEditing = {
      editingItemId: "item-1",
      editingItemTitle: "Task 1",
      setEditingItemId: jest.fn(),
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

    const result = createTodoListDetailEditingStateResult({
      itemEditing,
      titleEditing,
    });

    expect(result).toEqual({
      ...itemEditing,
      ...titleEditing,
    });
  });
});
