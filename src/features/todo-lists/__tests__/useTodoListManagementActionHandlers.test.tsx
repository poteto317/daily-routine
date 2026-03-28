import { act, renderHook } from "@testing-library/react";

jest.mock("../selectedTodoList", () => ({
  setSelectedTodoListId: jest.fn(),
}));

jest.mock("../todoListManagementPersistActions", () => ({
  createManagedTodoListsPersistAction: jest.fn(),
}));

jest.mock("../todoListManagementMutationHandlers", () => ({
  createTodoListCreateHandler: jest.fn(),
  createTodoListDeleteHandler: jest.fn(),
  createTodoListRenameHandler: jest.fn(),
  createTodoListVisibilityToggleHandler: jest.fn(),
}));

jest.mock("../todoListManagementActionHandlersResult", () => ({
  createTodoListManagementActionHandlersResult: jest.fn(),
}));

import { setSelectedTodoListId } from "../selectedTodoList";
import { createTodoListManagementActionHandlersResult } from "../todoListManagementActionHandlersResult";
import { createManagedTodoListsPersistAction } from "../todoListManagementPersistActions";
import {
  createTodoListCreateHandler,
  createTodoListDeleteHandler,
  createTodoListRenameHandler,
  createTodoListVisibilityToggleHandler,
} from "../todoListManagementMutationHandlers";
import type { TodoList } from "../types";
import { useTodoListManagementActionHandlers } from "../useTodoListManagementActionHandlers";
import texts from "../locales/ja.json";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("useTodoListManagementActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("action handler を組み立てて openList にも委譲する", () => {
    const persist = jest.fn();
    const handleCreate = jest.fn();
    const handleDelete = jest.fn();
    const handleRename = jest.fn();
    const handleToggleVisibility = jest.fn();
    const navigate = jest.fn();

    (createManagedTodoListsPersistAction as jest.Mock).mockReturnValue(persist);
    (createTodoListCreateHandler as jest.Mock).mockReturnValue(handleCreate);
    (createTodoListDeleteHandler as jest.Mock).mockReturnValue(handleDelete);
    (createTodoListRenameHandler as jest.Mock).mockReturnValue(handleRename);
    (createTodoListVisibilityToggleHandler as jest.Mock).mockReturnValue(
      handleToggleVisibility,
    );
    (
      createTodoListManagementActionHandlersResult as jest.Mock
    ).mockImplementation((value) => value);

    const params = {
      lists: [baseList],
      titleInput: "買い物",
      setLists: jest.fn(),
      closeForm: jest.fn(),
      navigate,
    };

    const { result } = renderHook(() =>
      useTodoListManagementActionHandlers(params),
    );

    act(() => {
      result.current.handleCreate();
      result.current.handleDelete(baseList);
      result.current.handleRename("list-1", "Work");
      result.current.handleToggleVisibility(baseList);
      result.current.openList("list-1");
    });

    expect(createManagedTodoListsPersistAction).toHaveBeenCalledWith({
      setLists: params.setLists,
    });
    expect(createTodoListCreateHandler).toHaveBeenCalledWith({
      lists: params.lists,
      titleInput: "買い物",
      persist,
      closeForm: params.closeForm,
    });
    expect(createTodoListVisibilityToggleHandler).toHaveBeenCalledWith({
      lists: params.lists,
      persist,
    });
    expect(createTodoListRenameHandler).toHaveBeenCalledWith({
      lists: params.lists,
      persist,
    });
    expect(createTodoListDeleteHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        lists: params.lists,
        persist,
      }),
    );
    expect(createTodoListManagementActionHandlersResult).toHaveBeenCalledWith({
      handleCreate,
      handleDelete,
      handleRename,
      handleToggleVisibility,
      openList: expect.any(Function),
    });

    const deleteHandlerArgs = (createTodoListDeleteHandler as jest.Mock).mock
      .calls[0][0];
    expect(deleteHandlerArgs.buildDeleteMessage(baseList)).toBe(
      texts.management.deleteConfirm.replace("{title}", "Inbox"),
    );

    expect(handleCreate).toHaveBeenCalled();
    expect(handleDelete).toHaveBeenCalledWith(baseList);
    expect(handleRename).toHaveBeenCalledWith("list-1", "Work");
    expect(handleToggleVisibility).toHaveBeenCalledWith(baseList);
    expect(setSelectedTodoListId).toHaveBeenCalledWith("list-1");
    expect(navigate).toHaveBeenCalledWith("todo-lists");
  });
});
