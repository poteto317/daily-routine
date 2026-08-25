import { renderHook } from "@testing-library/react";
import { useTodoListDetailDataState } from "../useTodoListDetailDataState";

jest.mock("../useTodoListHistory", () => ({
  useTodoListHistory: jest.fn(),
}));

jest.mock("../selectors", () => ({
  findTodoListById: jest.fn(),
}));

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveTodoListsToLocal: jest.fn(),
}));

import { useTodoListHistory } from "../useTodoListHistory";
import { findTodoListById } from "../selectors";
import { getTodoLists } from "../storage";
import { saveTodoListsToLocal } from "../sync";

describe("useTodoListDetailDataState", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  const persist = jest.fn();
  const undo = jest.fn();
  const redo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListHistory as jest.Mock).mockReturnValue({
      lists: [list],
      persist,
      undo,
      redo,
      canUndo: false,
      canRedo: true,
    });
    (findTodoListById as jest.Mock).mockReturnValue(list);
  });

  it("getTodoLists と saveTodoListsToLocal を注入して useTodoListHistory を呼ぶ", () => {
    renderHook(() => useTodoListDetailDataState("list-1"));

    expect(useTodoListHistory).toHaveBeenCalledWith({
      getInitialLists: getTodoLists,
      saveLists: saveTodoListsToLocal,
    });
  });

  it("lists・persist・undo・redo・list を組み立てる", () => {
    const { result } = renderHook(() => useTodoListDetailDataState("list-1"));

    expect(findTodoListById).toHaveBeenCalledWith([list], "list-1");
    expect(result.current.lists).toEqual([list]);
    expect(result.current.persist).toBe(persist);
    expect(result.current.undo).toBe(undo);
    expect(result.current.redo).toBe(redo);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(result.current.list).toEqual(list);
  });

  it("findTodoListById が null を返すとき list=null を返す", () => {
    (findTodoListById as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useTodoListDetailDataState("missing-id"),
    );

    expect(findTodoListById).toHaveBeenCalledWith([list], "missing-id");
    expect(result.current.list).toBeNull();
    // 履歴操作は list=null でも返される
    expect(result.current.persist).toBe(persist);
    expect(result.current.undo).toBe(undo);
    expect(result.current.redo).toBe(redo);
  });

  it("canUndo・canRedo を useTodoListHistory の値のままスルーする", () => {
    (useTodoListHistory as jest.Mock).mockReturnValue({
      lists: [list],
      persist,
      undo,
      redo,
      canUndo: true,
      canRedo: false,
    });

    const { result } = renderHook(() => useTodoListDetailDataState("list-1"));

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });
});
