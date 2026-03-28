import { renderHook } from "@testing-library/react";
import {
  useTodoListDetailState,
  useTodoListSelectionState,
} from "../useTodoListsPageState";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../selectedTodoList", () => ({
  getSelectedTodoListId: jest.fn(),
  setSelectedTodoListId: jest.fn(),
  subscribeSelectedTodoListId: jest.fn(() => () => undefined),
}));

jest.mock("../pageStateActions", () => ({
  syncSelectedTodoListIdIfNeeded: jest.fn(),
}));

jest.mock("../selectors", () => ({
  findTodoListById: jest.fn(),
  resolveSelectedTodoListId: jest.fn(),
}));

jest.mock("../todoListDetailPersistActions", () => ({
  createPersistTodoListsAction: jest.fn(),
}));

jest.mock("../todoListDetailHandlerBindings", () => ({
  createTodoListDetailHandlerBindings: jest.fn(),
}));

jest.mock("../todoListDetailStateResult", () => ({
  createTodoListDetailStateResult: jest.fn(),
}));

jest.mock("../todoListPageViewActions", () => ({
  createTodoListDetailHandlers: jest.fn(),
}));

import { getTodoLists } from "../storage";
import {
  getSelectedTodoListId,
  setSelectedTodoListId,
  subscribeSelectedTodoListId,
} from "../selectedTodoList";
import { syncSelectedTodoListIdIfNeeded } from "../pageStateActions";
import { findTodoListById, resolveSelectedTodoListId } from "../selectors";
import { createTodoListDetailHandlerBindings } from "../todoListDetailHandlerBindings";
import { createPersistTodoListsAction } from "../todoListDetailPersistActions";
import { createTodoListDetailStateResult } from "../todoListDetailStateResult";
import { createTodoListDetailHandlers } from "../todoListPageViewActions";

describe("useTodoListsPageState", () => {
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
    (getSelectedTodoListId as jest.Mock).mockReturnValue("missing");
    (resolveSelectedTodoListId as jest.Mock).mockReturnValue("list-1");
    (syncSelectedTodoListIdIfNeeded as jest.Mock).mockReturnValue(true);
    (findTodoListById as jest.Mock).mockReturnValue(list);
    (createPersistTodoListsAction as jest.Mock).mockReturnValue(jest.fn());
    (createTodoListDetailHandlerBindings as jest.Mock).mockImplementation(
      ({ list, lists, persist }) => ({ list, lists, persist }),
    );
    (createTodoListDetailStateResult as jest.Mock).mockImplementation(
      ({ detailHandlers, list }) => ({ detailHandlers, list }),
    );
    (createTodoListDetailHandlers as jest.Mock).mockReturnValue({
      onAddItem: jest.fn(),
      onToggleItem: jest.fn(),
      onDeleteItem: jest.fn(),
      onDeleteList: jest.fn(),
      onIndentItem: jest.fn(),
      onOutdentItem: jest.fn(),
      onReorderItems: jest.fn(),
      onUpdateItemTitle: jest.fn(),
      onUpdateListTitle: jest.fn(),
    });
  });

  it("選択中IDを解決して必要なら同期する", () => {
    const { result } = renderHook(() => useTodoListSelectionState());

    expect(subscribeSelectedTodoListId).toHaveBeenCalled();
    expect(resolveSelectedTodoListId).toHaveBeenCalledWith([list], "missing");
    expect(syncSelectedTodoListIdIfNeeded).toHaveBeenCalledWith(
      "list-1",
      "missing",
      setSelectedTodoListId,
    );
    expect(result.current.effectiveSelectedId).toBe("list-1");
  });

  it("詳細 state が list と handler 群を組み立てる", () => {
    const persist = jest.fn();
    (createPersistTodoListsAction as jest.Mock).mockReturnValue(persist);

    const { result } = renderHook(() => useTodoListDetailState("list-1"));

    expect(createPersistTodoListsAction).toHaveBeenCalledWith({
      setLists: expect.any(Function),
    });
    expect(findTodoListById).toHaveBeenCalledWith([list], "list-1");
    expect(createTodoListDetailHandlerBindings).toHaveBeenCalledWith({
      list,
      lists: [list],
      persist,
    });
    expect(createTodoListDetailHandlers).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteItemConfirmTemplate: expect.any(Function),
      deleteListConfirmTemplate: expect.any(Function),
    });
    expect(createTodoListDetailStateResult).toHaveBeenCalledWith({
      detailHandlers: expect.objectContaining({
        onAddItem: expect.any(Function),
        onToggleItem: expect.any(Function),
      }),
      list,
    });
    expect(result.current.list).toEqual(list);
    expect(result.current.detailHandlers).toEqual(
      expect.objectContaining({
        onAddItem: expect.any(Function),
        onToggleItem: expect.any(Function),
      }),
    );
  });

  it("対象 list がなければ handler を作らない", () => {
    (findTodoListById as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useTodoListDetailState("missing"));

    expect(createTodoListDetailHandlers).not.toHaveBeenCalled();
    expect(createTodoListDetailStateResult).toHaveBeenCalledWith({
      detailHandlers: null,
      list: null,
    });
    expect(result.current.list).toBeNull();
    expect(result.current.detailHandlers).toBeNull();
  });
});
