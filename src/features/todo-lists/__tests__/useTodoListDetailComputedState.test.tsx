import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailVisibility", () => ({
  useTodoListDetailVisibility: jest.fn(),
}));

jest.mock("../useTodoListDetailProgress", () => ({
  useTodoListDetailProgress: jest.fn(),
}));

jest.mock("../useTodoListDetailVisibleItems", () => ({
  useTodoListDetailVisibleItems: jest.fn(),
}));

jest.mock("../todoListDetailComputedStateResult", () => ({
  createTodoListDetailComputedStateResult: jest.fn(),
}));

import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";
import { useTodoListDetailVisibility } from "../useTodoListDetailVisibility";
import { useTodoListDetailProgress } from "../useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "../useTodoListDetailVisibleItems";
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
    (useTodoListDetailVisibility as jest.Mock).mockReturnValue({
      collapsedItemIds: new Set<string>(),
      hideCompleted: false,
      toggleCollapseItem: jest.fn(),
      toggleHideCompleted: jest.fn(),
    });
    (useTodoListDetailProgress as jest.Mock).mockReturnValue({
      progress: { completed: 1, total: 2, percentage: 50 },
    });
    (useTodoListDetailVisibleItems as jest.Mock).mockReturnValue({
      visibleItems: list.items,
    });
    (createTodoListDetailComputedStateResult as jest.Mock).mockReturnValue({
      computed: true,
    });
  });

  it("3つの独立フックを合成して result に委譲する", () => {
    const { result } = renderHook(() =>
      useTodoListDetailComputedState({ list }),
    );

    expect(useTodoListDetailVisibility).toHaveBeenCalledWith();
    expect(useTodoListDetailProgress).toHaveBeenCalledWith({ list });
    expect(useTodoListDetailVisibleItems).toHaveBeenCalledWith({
      hideCompleted: false,
      collapsedItemIds: expect.any(Set),
      list,
    });
    expect(createTodoListDetailComputedStateResult).toHaveBeenCalledWith({
      detailVisibility: {
        collapsedItemIds: expect.any(Set),
        hideCompleted: false,
        toggleCollapseItem: (useTodoListDetailVisibility as jest.Mock).mock
          .results[0].value.toggleCollapseItem,
        toggleHideCompleted: (useTodoListDetailVisibility as jest.Mock).mock
          .results[0].value.toggleHideCompleted,
      },
      detailProgress: {
        progress: { completed: 1, total: 2, percentage: 50 },
      },
      detailVisibleItems: {
        visibleItems: list.items,
      },
    });
    expect(result.current).toEqual({ computed: true });
  });
});
