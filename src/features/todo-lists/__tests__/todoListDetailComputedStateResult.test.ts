import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";

describe("todoListDetailComputedStateResult", () => {
  it("hideCompleted/collapsed/computed/action の公開 shape を組み立てる", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();
    const toggleMoveCompletedToBottom = jest.fn();
    const collapsedItemIds = new Set<string>();

    expect(
      createTodoListDetailComputedStateResult({
        detailProgress: {
          progress: { completed: 1, total: 2, percentage: 50 },
        },
        detailOrderedItems: {
          visibleItems: [{ id: "item-1" } as never],
        },
        detailVisibility: {
          collapsedItemIds,
          hideCompleted: true,
          toggleCollapseItem,
          toggleHideCompleted,
        },
        detailItemOrder: {
          moveCompletedToBottom: false,
          toggleMoveCompletedToBottom,
        },
      }),
    ).toEqual({
      collapsedItemIds,
      hideCompleted: true,
      moveCompletedToBottom: false,
      progress: { completed: 1, total: 2, percentage: 50 },
      toggleCollapseItem,
      toggleHideCompleted,
      toggleMoveCompletedToBottom,
      visibleItems: [{ id: "item-1" }],
    });
  });

  it("toggleCollapseItem と toggleHideCompleted が渡した参照のまま result にマッピングされる", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();
    const toggleMoveCompletedToBottom = jest.fn();

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 0, percentage: 0 } },
      detailOrderedItems: { visibleItems: [] },
      detailVisibility: {
        collapsedItemIds: new Set<string>(),
        hideCompleted: false,
        toggleCollapseItem,
        toggleHideCompleted,
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom,
      },
    });

    expect(result.toggleCollapseItem).toBe(toggleCollapseItem);
    expect(result.toggleHideCompleted).toBe(toggleHideCompleted);
    expect(result.toggleMoveCompletedToBottom).toBe(toggleMoveCompletedToBottom);
  });

  it("collapsedItemIds を visibility からそのまま伝播する（参照同一性）", () => {
    const collapsedItemIds = new Set<string>(["item-1", "item-2"]);
    const toggleCollapseItem = jest.fn();
    const toggleHideCompleted = jest.fn();
    const toggleMoveCompletedToBottom = jest.fn();

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 1, percentage: 0 } },
      detailOrderedItems: { visibleItems: [] },
      detailVisibility: {
        collapsedItemIds,
        hideCompleted: false,
        toggleCollapseItem,
        toggleHideCompleted,
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom,
      },
    });

    expect(result.collapsedItemIds).toBe(collapsedItemIds);
  });

  it("visibleItems を detailOrderedItems からそのまま伝播する（参照同一性）", () => {
    const visibleItems = [{ id: "item-1" } as never];

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 1, percentage: 0 } },
      detailOrderedItems: { visibleItems },
      detailVisibility: {
        collapsedItemIds: new Set<string>(),
        hideCompleted: false,
        toggleCollapseItem: jest.fn(),
        toggleHideCompleted: jest.fn(),
      },
      detailItemOrder: {
        moveCompletedToBottom: false,
        toggleMoveCompletedToBottom: jest.fn(),
      },
    });

    expect(result.visibleItems).toBe(visibleItems);
  });
});
