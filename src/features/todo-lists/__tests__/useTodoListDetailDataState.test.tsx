import { renderHook } from "@testing-library/react";
import { useTodoListDetailDataState } from "../useTodoListDetailDataState";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../selectors", () => ({
  findTodoListById: jest.fn(),
}));

jest.mock("../todoListDetailPersistActions", () => ({
  createPersistTodoListsAction: jest.fn(),
}));

import { findTodoListById } from "../selectors";
import { getTodoLists } from "../storage";
import { createPersistTodoListsAction } from "../todoListDetailPersistActions";

describe("useTodoListDetailDataState", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTodoLists as jest.Mock).mockReturnValue([list]);
    (findTodoListById as jest.Mock).mockReturnValue(list);
    (createPersistTodoListsAction as jest.Mock).mockReturnValue(jest.fn());
  });

  it("lists と persist と list を組み立てる", () => {
    const persist = jest.fn();
    (createPersistTodoListsAction as jest.Mock).mockReturnValue(persist);

    const { result } = renderHook(() => useTodoListDetailDataState("list-1"));

    expect(createPersistTodoListsAction).toHaveBeenCalledWith({
      setLists: expect.any(Function),
    });
    expect(findTodoListById).toHaveBeenCalledWith([list], "list-1");
    expect(result.current.lists).toEqual([list]);
    expect(result.current.persist).toBe(persist);
    expect(result.current.list).toEqual(list);
  });
});
