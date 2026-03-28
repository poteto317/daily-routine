import { createTodoListDetailItemEditingStateResult } from "../todoListDetailItemEditingStateResult";

describe("createTodoListDetailItemEditingStateResult", () => {
  it("item editing state の公開 shape を返す", () => {
    const setEditingItemId = jest.fn();
    const setEditingItemTitle = jest.fn();
    const startEditItem = jest.fn();

    expect(
      createTodoListDetailItemEditingStateResult({
        editingItemId: "item-1",
        editingItemTitle: "Task 1",
        setEditingItemId,
        setEditingItemTitle,
        startEditItem,
      }),
    ).toEqual({
      editingItemId: "item-1",
      editingItemTitle: "Task 1",
      setEditingItemId,
      setEditingItemTitle,
      startEditItem,
    });
  });
});
