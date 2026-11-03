import type { TodoList } from "../types";
import { createTodoListManagementDataStateResult } from "../todoListManagementDataStateResult";

describe("createTodoListManagementDataStateResult", () => {
  it("lists・action handlers・handleReorderLists の公開 shape を返す", () => {
    const lists: TodoList[] = [
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ];
    const actionHandlers = {
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleToggleVisibility: jest.fn(),
      openList: jest.fn(),
    };
    const handleReorderLists = jest.fn();

    const result = createTodoListManagementDataStateResult({
      lists,
      actionHandlers,
      handleReorderLists,
    });

    expect(result).toEqual({
      lists,
      ...actionHandlers,
      handleReorderLists,
    });
    expect(result.handleReorderLists).toBe(handleReorderLists);
  });
});
