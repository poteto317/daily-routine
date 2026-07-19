import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailHideCompleted", () => ({
  useTodoListDetailHideCompleted: jest.fn(),
}));

jest.mock("../useTodoListDetailCollapsedItems", () => ({
  useTodoListDetailCollapsedItems: jest.fn(),
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
import { useTodoListDetailProgress } from "../useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "../useTodoListDetailVisibleItems";
import { useTodoListDetailOrderedItems } from "../useTodoListDetailOrderedItems";
import { useTodoListDetailComputedState } from "../useTodoListDetailComputedState";
import type { TodoCategory } from "../types";

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
  const categories: TodoCategory[] = [
    { id: "cat-1", name: "仕事", createdAt: "2026-03-07T00:00:00.000Z" },
  ];

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
    const onUpdateListHideCompleted = jest.fn();
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        categories,
        onUpdateListHideCompleted,
      }),
    );

    expect(useTodoListDetailHideCompleted).toHaveBeenCalledWith({
      list,
      onUpdateListHideCompleted,
    });
    expect(useTodoListDetailCollapsedItems).toHaveBeenCalledWith();
    expect(useTodoListDetailProgress).toHaveBeenCalledWith({ list });
  });

  it("useTodoListDetailVisibleItems に hideCompleted と collapsedItemIds をそれぞれの独立フックから渡す", () => {
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        categories,
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(useTodoListDetailVisibleItems).toHaveBeenCalledWith({
      hideCompleted: false,
      collapsedItemIds: expect.any(Set),
      list,
    });
  });

  it("useTodoListDetailOrderedItems に filteredItems と categoryLookup を渡す（トグルフラグは存在しない）", () => {
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        categories,
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    expect(useTodoListDetailOrderedItems).toHaveBeenCalledWith({
      filteredItems: list.items,
      categoryLookup: expect.any(Map),
    });
  });

  it("categories から categoryLookup を構築する", () => {
    renderHook(() =>
      useTodoListDetailComputedState({
        list,
        categories,
        onUpdateListHideCompleted: jest.fn(),
      }),
    );

    const call = (useTodoListDetailOrderedItems as jest.Mock).mock.calls[0][0];
    expect(call.categoryLookup.get("cat-1")).toEqual(categories[0]);
  });

  it("独立フックを合成して result に委譲する", () => {
    const onUpdateListHideCompleted = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailComputedState({
        list,
        categories,
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
      detailProgress: {
        progress: { completed: 1, total: 2, percentage: 50 },
      },
      detailOrderedItems: {
        visibleItems: list.items,
      },
      categoryLookup: expect.any(Map),
    });
    expect(result.current).toEqual({ computed: true });
  });
});
