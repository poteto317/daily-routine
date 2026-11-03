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

jest.mock("../useTodoListManagementMenuOrder", () => ({
  useTodoListManagementMenuOrder: jest.fn(),
}));

import { getTodoLists } from "../storage";
import type { TodoList } from "../types";
import { createTodoListManagementDataStateResult } from "../todoListManagementDataStateResult";
import { useTodoListManagementActionHandlers } from "../useTodoListManagementActionHandlers";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";
import { useTodoListManagementMenuOrder } from "../useTodoListManagementMenuOrder";

describe("useTodoListManagementDataState composition", () => {
  it("lists state・action handlers・handleReorderLists を compose する", () => {
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
    const builtResult = {
      lists,
      ...actionHandlers,
      handleReorderLists,
    };
    const closeForm = jest.fn();
    const navigate = jest.fn();

    (getTodoLists as jest.Mock).mockReturnValue(lists);
    (useTodoListManagementActionHandlers as jest.Mock).mockReturnValue(
      actionHandlers,
    );
    (useTodoListManagementMenuOrder as jest.Mock).mockReturnValue({
      menuOrder: [],
      handleReorderLists,
    });
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
      handleReorderLists,
      lists,
    });
    expect(
      (createTodoListManagementDataStateResult as jest.Mock).mock.calls[0][0]
        .handleReorderLists,
    ).toBe(handleReorderLists);
    expect(result.current).toBe(builtResult);
  });
});
