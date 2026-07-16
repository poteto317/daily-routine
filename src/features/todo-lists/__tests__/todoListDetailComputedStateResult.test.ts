import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";

describe("todoListDetailComputedStateResult", () => {
  it("hideCompleted/collapsed/computed/action の公開 shape を組み立てる", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();
    const toggleMoveCompletedToBottom = jest.fn();
    const toggleGroupByCategory = jest.fn();
    const collapsedItemIds = new Set<string>();
    const categoryLookup = new Map();

    expect(
      createTodoListDetailComputedStateResult({
        detailProgress: {
          progress: { completed: 1, total: 2, percentage: 50 },
        },
        detailOrderedItems: {
          visibleItems: [{ id: "item-1" } as never],
        },
        detailHideCompleted: {
          hideCompleted: true,
          toggleHideCompleted,
        },
        detailCollapsedItems: {
          collapsedItemIds,
          toggleCollapseItem,
        },
        detailItemOrder: {
          moveCompletedToBottom: false,
          toggleMoveCompletedToBottom,
        },
        detailGroupByCategory: {
          groupByCategory: false,
          toggleGroupByCategory,
        },
        categoryLookup,
      }),
    ).toEqual({
      collapsedItemIds,
      hideCompleted: true,
      moveCompletedToBottom: false,
      groupByCategory: false,
      progress: { completed: 1, total: 2, percentage: 50 },
      toggleCollapseItem,
      toggleHideCompleted,
      toggleMoveCompletedToBottom,
      toggleGroupByCategory,
      visibleItems: [{ id: "item-1" }],
      categoryLookup,
    });
  });

  it("toggleCollapseItem・toggleHideCompleted・toggleGroupByCategory が渡した参照のまま result にマッピングされる", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();
    const toggleMoveCompletedToBottom = jest.fn();
    const toggleGroupByCategory = jest.fn();

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 0, percentage: 0 } },
      detailOrderedItems: { visibleItems: [] },
      detailHideCompleted: {
        hideCompleted: false,
        toggleHideCompleted,
      },
      detailCollapsedItems: {
        collapsedItemIds: new Set<string>(),
        toggleCollapseItem,
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom,
      },
      detailGroupByCategory: {
        groupByCategory: false,
        toggleGroupByCategory,
      },
      categoryLookup: new Map(),
    });

    expect(result.toggleCollapseItem).toBe(toggleCollapseItem);
    expect(result.toggleHideCompleted).toBe(toggleHideCompleted);
    expect(result.toggleMoveCompletedToBottom).toBe(toggleMoveCompletedToBottom);
    expect(result.toggleGroupByCategory).toBe(toggleGroupByCategory);
  });

  it("collapsedItemIds を detailCollapsedItems からそのまま伝播する（参照同一性）", () => {
    const collapsedItemIds = new Set<string>(["item-1", "item-2"]);

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 1, percentage: 0 } },
      detailOrderedItems: { visibleItems: [] },
      detailHideCompleted: {
        hideCompleted: false,
        toggleHideCompleted: jest.fn(),
      },
      detailCollapsedItems: {
        collapsedItemIds,
        toggleCollapseItem: jest.fn(),
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom: jest.fn(),
      },
      detailGroupByCategory: {
        groupByCategory: false,
        toggleGroupByCategory: jest.fn(),
      },
      categoryLookup: new Map(),
    });

    expect(result.collapsedItemIds).toBe(collapsedItemIds);
  });

  it("visibleItems を detailOrderedItems からそのまま伝播する（参照同一性）", () => {
    const visibleItems = [{ id: "item-1" } as never];

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 1, percentage: 0 } },
      detailOrderedItems: { visibleItems },
      detailHideCompleted: {
        hideCompleted: false,
        toggleHideCompleted: jest.fn(),
      },
      detailCollapsedItems: {
        collapsedItemIds: new Set<string>(),
        toggleCollapseItem: jest.fn(),
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom: jest.fn(),
      },
      detailGroupByCategory: {
        groupByCategory: false,
        toggleGroupByCategory: jest.fn(),
      },
      categoryLookup: new Map(),
    });

    expect(result.visibleItems).toBe(visibleItems);
  });

  it("categoryLookup を渡した参照のまま result に伝播する（参照同一性）", () => {
    const categoryLookup = new Map([["cat-1", { id: "cat-1" } as never]]);

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 1, percentage: 0 } },
      detailOrderedItems: { visibleItems: [] },
      detailHideCompleted: {
        hideCompleted: false,
        toggleHideCompleted: jest.fn(),
      },
      detailCollapsedItems: {
        collapsedItemIds: new Set<string>(),
        toggleCollapseItem: jest.fn(),
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom: jest.fn(),
      },
      detailGroupByCategory: {
        groupByCategory: true,
        toggleGroupByCategory: jest.fn(),
      },
      categoryLookup,
    });

    expect(result.categoryLookup).toBe(categoryLookup);
    expect(result.groupByCategory).toBe(true);
  });
});
