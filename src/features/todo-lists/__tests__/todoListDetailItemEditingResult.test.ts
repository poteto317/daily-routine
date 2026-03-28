import { createTodoListDetailItemEditingResult } from "../todoListDetailItemEditingResult";

describe("createTodoListDetailItemEditingResult", () => {
  it("item editing state と actions の公開 shape をまとめて返す", () => {
    const itemEditingState = {
      editingItemId: "item-1",
      editingItemTitle: "Task 1",
      setEditingItemId: jest.fn(),
      setEditingItemTitle: jest.fn(),
      startEditItem: jest.fn(),
    };
    const itemEditingActions = {
      cancelEditItem: jest.fn(),
      commitEditItem: jest.fn(),
    };

    const result = createTodoListDetailItemEditingResult({
      itemEditingState,
      itemEditingActions,
    });

    expect(result).toEqual({
      ...itemEditingState,
      ...itemEditingActions,
    });
  });
});
