import type { TodoList } from "../types";
import { createTodoListManagementActionHandlersResult } from "../todoListManagementActionHandlersResult";

describe("createTodoListManagementActionHandlersResult", () => {
  it("management action handlers の公開 shape を返す", () => {
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    } satisfies TodoList;
    const handleCreate = jest.fn();
    const handleDelete = jest.fn();
    const handleRename = jest.fn();
    const handleToggleVisibility = jest.fn();
    const openList = jest.fn();

    const result = createTodoListManagementActionHandlersResult({
      handleCreate,
      handleDelete,
      handleRename,
      handleToggleVisibility,
      openList,
    });

    result.handleCreate();
    result.handleDelete(list);
    result.handleRename("list-1", "Work");
    result.handleToggleVisibility(list);
    result.openList("list-1");

    expect(result).toEqual({
      handleCreate,
      handleDelete,
      handleRename,
      handleToggleVisibility,
      openList,
    });
    expect(handleCreate).toHaveBeenCalled();
    expect(handleDelete).toHaveBeenCalledWith(list);
    expect(handleRename).toHaveBeenCalledWith("list-1", "Work");
    expect(handleToggleVisibility).toHaveBeenCalledWith(list);
    expect(openList).toHaveBeenCalledWith("list-1");
  });
});
