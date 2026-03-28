import type { TodoList } from "../types";
import { createTodoListManagementDataStateResult } from "../todoListManagementDataStateResult";

describe("createTodoListManagementDataStateResult", () => {
  it("lists と action handlers の公開 shape を返す", () => {
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

    expect(
      createTodoListManagementDataStateResult({
        lists,
        actionHandlers,
      }),
    ).toEqual({
      lists,
      ...actionHandlers,
    });
  });
});
