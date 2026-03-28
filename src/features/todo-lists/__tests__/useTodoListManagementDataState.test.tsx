import { act, renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../useTodoListManagementActionHandlers", () => ({
  useTodoListManagementActionHandlers: jest.fn(),
}));

import { getTodoLists } from "../storage";
import type { TodoList } from "../types";
import { useTodoListManagementActionHandlers } from "../useTodoListManagementActionHandlers";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";

describe("useTodoListManagementDataState", () => {
  const baseList: TodoList = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTodoLists as jest.Mock).mockReturnValue([baseList]);
    (useTodoListManagementActionHandlers as jest.Mock).mockReturnValue({
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleToggleVisibility: jest.fn(),
      openList: jest.fn(),
    });
  });

  it("初期リストを保持し action handler hook に委譲する", () => {
    const closeForm = jest.fn();
    const navigate = jest.fn();

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "買い物",
        closeForm,
        navigate,
      }),
    );

    expect(result.current.lists).toEqual([baseList]);
    expect(useTodoListManagementActionHandlers).toHaveBeenCalledWith({
      lists: [baseList],
      titleInput: "買い物",
      setLists: expect.any(Function),
      closeForm,
      navigate,
    });
    expect(result.current.handleCreate).toEqual(expect.any(Function));
    expect(result.current.openList).toEqual(expect.any(Function));
  });

  it("action handler から受け取った setter 経由で lists を更新できる", () => {
    let capturedSetLists: ((value: (typeof baseList)[]) => void) | undefined;
    (useTodoListManagementActionHandlers as jest.Mock).mockImplementation(
      ({ setLists }) => {
        capturedSetLists = setLists;
        return {
          handleCreate: jest.fn(),
          handleDelete: jest.fn(),
          handleRename: jest.fn(),
          handleToggleVisibility: jest.fn(),
          openList: jest.fn(),
        };
      },
    );

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "",
        closeForm: jest.fn(),
        navigate: jest.fn(),
      }),
    );

    act(() => {
      capturedSetLists?.([
        ...result.current.lists,
        {
          id: "list-2",
          title: "Work",
          items: [],
          createdAt: "2026-03-08T00:00:00.000Z",
          updatedAt: "2026-03-08T00:00:00.000Z",
        },
      ]);
    });

    expect(result.current.lists).toEqual([
      baseList,
      expect.objectContaining({ id: "list-2", title: "Work" }),
    ]);
  });
});
