import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailDataState", () => ({
  useTodoListDetailDataState: jest.fn(),
}));

jest.mock("../useTodoListDetailHandlers", () => ({
  useTodoListDetailHandlers: jest.fn(),
}));

jest.mock("../todoListDetailHandlerBindings", () => ({
  createTodoListDetailHandlerBindings: jest.fn(),
}));

import { createTodoListDetailHandlerBindings } from "../todoListDetailHandlerBindings";
import { useTodoListDetailDataState } from "../useTodoListDetailDataState";
import { useTodoListDetailHandlers } from "../useTodoListDetailHandlers";
import { useTodoListDetailState } from "../useTodoListDetailState";

describe("useTodoListDetailState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    (useTodoListDetailDataState as jest.Mock).mockReturnValue({
      list,
      lists: [list],
      persist: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: false,
      canRedo: true,
    });
    (createTodoListDetailHandlerBindings as jest.Mock).mockImplementation(
      (params) => params,
    );
    (useTodoListDetailHandlers as jest.Mock).mockReturnValue({
      detailHandlers: { onAddItem: jest.fn() },
    });
  });

  it("detail data と handlers を compose してフラットなオブジェクトを返す", () => {
    const { result } = renderHook(() => useTodoListDetailState("list-1"));

    expect(useTodoListDetailDataState).toHaveBeenCalledWith("list-1");
    expect(createTodoListDetailHandlerBindings).toHaveBeenCalledWith({
      list: expect.objectContaining({ id: "list-1" }),
      lists: [expect.objectContaining({ id: "list-1" })],
      persist: expect.any(Function),
    });
    expect(useTodoListDetailHandlers).toHaveBeenCalledWith({
      list: expect.objectContaining({ id: "list-1" }),
      lists: [expect.objectContaining({ id: "list-1" })],
      persist: expect.any(Function),
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        detailHandlers: { onAddItem: expect.any(Function) },
        list: expect.objectContaining({ id: "list-1" }),
        undo: expect.any(Function),
        redo: expect.any(Function),
        canUndo: false,
        canRedo: true,
      }),
    );
  });

  it("undo/redo/canUndo/canRedo を data state からスルーする", () => {
    const { result } = renderHook(() => useTodoListDetailState("list-1"));

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(result.current.undo).toEqual(expect.any(Function));
    expect(result.current.redo).toEqual(expect.any(Function));
  });

  it("list が null のとき detailHandlers=null を返す", () => {
    (useTodoListDetailDataState as jest.Mock).mockReturnValue({
      list: null,
      lists: [],
      persist: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: false,
      canRedo: false,
    });
    (useTodoListDetailHandlers as jest.Mock).mockReturnValue({
      detailHandlers: null,
    });

    const { result } = renderHook(() => useTodoListDetailState("missing"));

    expect(result.current.list).toBeNull();
    expect(result.current.detailHandlers).toBeNull();
    expect(result.current.undo).toEqual(expect.any(Function));
    expect(result.current.redo).toEqual(expect.any(Function));
  });

  it("createTodoListDetailStateResult を経由せずフラットなオブジェクトを直接返す", () => {
    const { result } = renderHook(() => useTodoListDetailState("list-1"));

    // 余計なラッパー関数を経由せず、必要なキーを直接持つことを確認
    expect(Object.keys(result.current)).toEqual(
      expect.arrayContaining([
        "detailHandlers",
        "list",
        "undo",
        "redo",
        "canUndo",
        "canRedo",
      ]),
    );
  });
});
