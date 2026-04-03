import { renderHook } from "@testing-library/react";
import { useTodoListDetailHandlers } from "../useTodoListDetailHandlers";

jest.mock("../todoListDetailCrudHandlerFactory", () => ({
  createTodoListDetailHandlers: jest.fn(),
}));

jest.mock("../todoListDetailConfirmMessages", () => ({
  createDeleteItemConfirmMessage: jest.fn((t: string) => `item:${t}`),
  createDeleteListConfirmMessage: jest.fn((t: string) => `list:${t}`),
}));

import { createTodoListDetailHandlers } from "../todoListDetailCrudHandlerFactory";
import {
  createDeleteItemConfirmMessage,
  createDeleteListConfirmMessage,
} from "../todoListDetailConfirmMessages";

describe("useTodoListDetailHandlers", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("list があるとき detail handlers を組み立てる", () => {
    const detailHandlers = {
      onAddItem: jest.fn(),
      onToggleItem: jest.fn(),
      onDeleteItem: jest.fn(),
      onDeleteList: jest.fn(),
      onIndentItem: jest.fn(),
      onOutdentItem: jest.fn(),
      onReorderItems: jest.fn(),
      onUpdateItemTitle: jest.fn(),
      onUpdateListTitle: jest.fn(),
    };
    const persist = jest.fn();
    (createTodoListDetailHandlers as jest.Mock).mockReturnValue(detailHandlers);

    const { result } = renderHook(() =>
      useTodoListDetailHandlers({
        list,
        lists: [list],
        persist,
      }),
    );

    expect(createTodoListDetailHandlers).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteItemConfirmTemplate: expect.any(Function),
      deleteListConfirmTemplate: expect.any(Function),
    });
    expect(result.current.detailHandlers).toBe(detailHandlers);
  });

  it("list がなければ null を返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailHandlers({
        list: null,
        lists: [],
        persist: jest.fn(),
      }),
    );

    expect(createTodoListDetailHandlers).not.toHaveBeenCalled();
    expect(result.current.detailHandlers).toBeNull();
  });

  it("deleteItemConfirmTemplate は createDeleteItemConfirmMessage に委譲する", () => {
    const persist = jest.fn();
    (createTodoListDetailHandlers as jest.Mock).mockReturnValue({});

    renderHook(() =>
      useTodoListDetailHandlers({ list, lists: [list], persist }),
    );

    const call = (createTodoListDetailHandlers as jest.Mock).mock.calls[0][0];
    call.deleteItemConfirmTemplate("Task A");

    expect(createDeleteItemConfirmMessage).toHaveBeenCalledWith("Task A");
  });

  it("deleteListConfirmTemplate は createDeleteListConfirmMessage に委譲する", () => {
    const persist = jest.fn();
    (createTodoListDetailHandlers as jest.Mock).mockReturnValue({});

    renderHook(() =>
      useTodoListDetailHandlers({ list, lists: [list], persist }),
    );

    const call = (createTodoListDetailHandlers as jest.Mock).mock.calls[0][0];
    call.deleteListConfirmTemplate("Inbox");

    expect(createDeleteListConfirmMessage).toHaveBeenCalledWith("Inbox");
  });
});
