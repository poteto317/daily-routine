import { act, renderHook } from "@testing-library/react";
import { createTodoListCollapsedItemsStateResult } from "../todoListCollapsedItemsStateResult";
import { useTodoListCollapsedItemsState } from "../useTodoListCollapsedItemsState";

jest.mock("../todoListCollapsedItemsStateResult", () => ({
  createTodoListCollapsedItemsStateResult: jest.fn(),
}));

describe("useTodoListCollapsedItemsState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createTodoListCollapsedItemsStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("collapsedItemIds を空の Set で初期化し result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListCollapsedItemsState());

    expect(createTodoListCollapsedItemsStateResult).toHaveBeenCalledWith({
      collapsedItemIds: expect.any(Set),
      setCollapsedItemIds: expect.any(Function),
    });
    expect(result.current.collapsedItemIds.size).toBe(0);
  });

  it("setCollapsedItemIds で collapsedItemIds を更新できる", () => {
    const { result } = renderHook(() => useTodoListCollapsedItemsState());

    act(() => {
      result.current.setCollapsedItemIds(new Set(["item-1"]));
    });

    expect(result.current.collapsedItemIds.has("item-1")).toBe(true);
  });

  it("setCollapsedItemIds で空の Set に戻せる", () => {
    const { result } = renderHook(() => useTodoListCollapsedItemsState());

    act(() => {
      result.current.setCollapsedItemIds(new Set(["item-1"]));
    });

    act(() => {
      result.current.setCollapsedItemIds(new Set());
    });

    expect(result.current.collapsedItemIds.size).toBe(0);
  });
});
