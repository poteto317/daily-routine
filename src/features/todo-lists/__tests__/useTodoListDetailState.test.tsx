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

jest.mock("../todoListDetailStateResult", () => ({
  createTodoListDetailStateResult: jest.fn(),
}));

import { createTodoListDetailHandlerBindings } from "../todoListDetailHandlerBindings";
import { createTodoListDetailStateResult } from "../todoListDetailStateResult";
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
    });
    (createTodoListDetailHandlerBindings as jest.Mock).mockImplementation(
      (params) => params,
    );
    (useTodoListDetailHandlers as jest.Mock).mockReturnValue({
      detailHandlers: { onAddItem: jest.fn() },
    });
    (createTodoListDetailStateResult as jest.Mock).mockImplementation(
      (params) => params,
    );
  });

  it("detail data と handler/result helper を compose する", () => {
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
    expect(createTodoListDetailStateResult).toHaveBeenCalledWith({
      detailHandlers: { onAddItem: expect.any(Function) },
      list: expect.objectContaining({ id: "list-1" }),
    });
    expect(result.current).toEqual({
      detailHandlers: { onAddItem: expect.any(Function) },
      list: expect.objectContaining({ id: "list-1" }),
    });
  });
});
