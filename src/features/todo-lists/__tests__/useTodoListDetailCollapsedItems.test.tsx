import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListCollapsedItemsState", () => ({
  useTodoListCollapsedItemsState: jest.fn(),
}));

jest.mock("../useTodoListCollapseItemActions", () => ({
  useTodoListCollapseItemActions: jest.fn(),
}));

jest.mock("../todoListDetailCollapsedItemsResult", () => ({
  createTodoListDetailCollapsedItemsResult: jest.fn(),
}));

import { createTodoListDetailCollapsedItemsResult } from "../todoListDetailCollapsedItemsResult";
import { useTodoListCollapseItemActions } from "../useTodoListCollapseItemActions";
import { useTodoListCollapsedItemsState } from "../useTodoListCollapsedItemsState";
import { useTodoListDetailCollapsedItems } from "../useTodoListDetailCollapsedItems";

describe("useTodoListDetailCollapsedItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListCollapsedItemsState as jest.Mock).mockReturnValue({
      collapsedItemIds: new Set<string>(),
      setCollapsedItemIds: jest.fn(),
    });
    (useTodoListCollapseItemActions as jest.Mock).mockReturnValue({
      toggleCollapseItem: jest.fn(),
    });
    (createTodoListDetailCollapsedItemsResult as jest.Mock).mockReturnValue({
      collapsedItems: true,
    });
  });

  it("state と action を合成して result に委譲する", () => {
    const { result } = renderHook(() => useTodoListDetailCollapsedItems());

    expect(useTodoListCollapsedItemsState).toHaveBeenCalledWith();
    expect(useTodoListCollapseItemActions).toHaveBeenCalledWith({
      setCollapsedItemIds: (useTodoListCollapsedItemsState as jest.Mock).mock
        .results[0].value.setCollapsedItemIds,
    });
    expect(createTodoListDetailCollapsedItemsResult).toHaveBeenCalledWith({
      collapsedItemsState: {
        collapsedItemIds: expect.any(Set),
        setCollapsedItemIds: (useTodoListCollapsedItemsState as jest.Mock).mock
          .results[0].value.setCollapsedItemIds,
      },
      collapseItemActions: {
        toggleCollapseItem: (useTodoListCollapseItemActions as jest.Mock).mock
          .results[0].value.toggleCollapseItem,
      },
    });
    expect(result.current).toEqual({ collapsedItems: true });
  });

  it("引数を取らない（list や永続化ハンドラに依存しない）", () => {
    expect(() =>
      renderHook(() => useTodoListDetailCollapsedItems()),
    ).not.toThrow();
  });
});
