import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailHideCompleted", () => ({
  useTodoListDetailHideCompleted: jest.fn(),
}));

jest.mock("../useTodoListDetailCollapsedItems", () => ({
  useTodoListDetailCollapsedItems: jest.fn(),
}));

jest.mock("../useTodoListDetailItemOrder", () => ({
  useTodoListDetailItemOrder: jest.fn(),
}));

jest.mock("../useTodoListDetailProgress", () => ({
  useTodoListDetailProgress: jest.fn(),
}));

jest.mock("../useTodoListDetailVisibleItems", () => ({
  useTodoListDetailVisibleItems: jest.fn(),
}));

jest.mock("../useTodoListDetailOrderedItems", () => ({
  useTodoListDetailOrderedItems: jest.fn(),
}));

jest.mock("../todoListDetailComputedStateResult", () => ({
  createTodoListDetailComputedStateResult: jest.fn(),
}));

import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";
import { useTodoListDetailCollapsedItems } from "../useTodoListDetailCollapsedItems";
import { useTodoListDetailHideCompleted } from "../useTodoListDetailHideCompleted";
import { useTodoListDetailItemOrder } from "../useTodoListDetailItemOrder";
import { useTodoListDetailProgress } from "../useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "../useTodoListDetailVisibleItems";
import { useTodoListDetailOrderedItems } from "../useTodoListDetailOrderedItems";
import { useTodoListDetailComputedState } from "../useTodoListDetailComputedState";

describe("useTodoListDetailComputedState", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [
      {
        id: "item-1",
        title: "Task 1",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
      {
        id: "item-2",
        title: "Done Task",
        isCompleted: true,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailHideCompleted as jest.Mock).mockReturnValue({
      hideCompleted: false,
      toggleHideCompleted: jest.fn(),
    });
    (useTodoListDetailCollapsedItems as jest.Mock).mockReturnValue({
      collapsedItemIds: new Set<string>(),
      toggleCollapseItem: jest.fn(),
    });
    (useTodoListDetailItemOrder as jest.Mock).mockReturnValue({
      moveCompletedToBottom: false,
      toggleMoveCompletedToBottom: jest.fn(),
    });
    (useTodoListDetailProgress as jest.Mock).mockReturnValue({
      progress: { completed: 1, total: 2, percentage: 50 },
    });
    (useTodoListDetailVisibleItems as jest.Mock).mockReturnValue({
      filteredItems: list.items,
    });
    (useTodoListDetailOrderedItems as jest.Mock).mockReturnValue({
      visibleItems: list.items,
    });
    (createTodoListDetailComputedStateResult as jest.Mock).mockReturnValue({
      computed: true,
    });
  });

  it("独立した各フックを正しい引数で呼ぶ", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const onUpdateListHideCompleted = jest.fn();
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        onUpdateListMoveCompletedToBottom,
        onUpdateListHideCompleted,
      }),
    );

    expect(useTodoListDetailHideCompleted).toHaveBeenCalledWith({
      list,
      onUpdateListHideCompleted,
    });
    expect(useTodoListDetailCollapsedItems).toHaveBeenCalledWith();
    expect(useTodoListDetailItemOrder).toHaveBeenCalledWith({
      list,
      onUpdateListMoveCompletedToBottom,
    });
    expect(useTodoListDetailProgress).toHaveBeenCalledWith({ list });
  });

  it("useTodoListDetailVisibleItems に hideCompleted と collapsedItemIds をそれぞれの独立フックから渡す", () => {
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(useTodoListDetailVisibleItems).toHaveBeenCalledWith({
      hideCompleted: false,
      collapsedItemIds: expect.any(Set),
      list,
    });
  });

  it("useTodoListDetailOrderedItems に moveCompletedToBottom を itemOrder フックから渡す", () => {
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        onUpdateListMoveCompletedToBottom: jest.fn(),
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(useTodoListDetailOrderedItems).toHaveBeenCalledWith({
      filteredItems: list.items,
      moveCompletedToBottom: false,
    });
  });

  it("5つの独立フックを合成して result に委譲する", () => {
    const onUpdateListMoveCompletedToBottom = jest.fn();
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailComputedState({
        list,
        onUpdateListMoveCompletedToBottom,
        onUpdateListHideCompleted,
      }),
    );

    expect(createTodoListDetailComputedStateResult).toHaveBeenCalledWith({
      detailHideCompleted: {
        hideCompleted: false,
        toggleHideCompleted: (useTodoListDetailHideCompleted as jest.Mock).mock
          .results[0].value.toggleHideCompleted,
      },
      detailCollapsedItems: {
        collapsedItemIds: expect.any(Set),
        toggleCollapseItem: (useTodoListDetailCollapsedItems as jest.Mock).mock
          .results[0].value.toggleCollapseItem,
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom: (useTodoListDetailItemOrder as jest.Mock)
          .mock.results[0].value.toggleMoveCompletedToBottom,
      },
      detailProgress: {
        progress: { completed: 1, total: 2, percentage: 50 },
      },
      detailOrderedItems: {
        visibleItems: list.items,
      },
    });
    expect(result.current).toEqual({ computed: true });
  });
});
