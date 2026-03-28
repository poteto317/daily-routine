import { renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../useTodoListManagementActionHandlers", () => ({
  useTodoListManagementActionHandlers: jest.fn(),
}));

jest.mock("../todoListManagementDataStateResult", () => ({
  createTodoListManagementDataStateResult: jest.fn(),
}));

import { getTodoLists } from "../storage";
import type { TodoList } from "../types";
import { createTodoListManagementDataStateResult } from "../todoListManagementDataStateResult";
import { useTodoListManagementActionHandlers } from "../useTodoListManagementActionHandlers";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";

describe("useTodoListManagementDataState composition", () => {
  it("lists state と action handlers を compose する", () => {
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
    const builtResult = {
      lists,
      ...actionHandlers,
    };
    const closeForm = jest.fn();
    const navigate = jest.fn();

    (getTodoLists as jest.Mock).mockReturnValue(lists);
    (useTodoListManagementActionHandlers as jest.Mock).mockReturnValue(
      actionHandlers,
    );
    (createTodoListManagementDataStateResult as jest.Mock).mockReturnValue(
      builtResult,
    );

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "買い物",
        closeForm,
        navigate,
      }),
    );

    expect(useTodoListManagementActionHandlers).toHaveBeenCalledWith({
      lists,
      titleInput: "買い物",
      setLists: expect.any(Function),
      closeForm,
      navigate,
    });
    expect(createTodoListManagementDataStateResult).toHaveBeenCalledWith({
      actionHandlers,
      lists,
    });
    expect(result.current).toBe(builtResult);
  });
});
