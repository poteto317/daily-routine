import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";

describe("todoListDetailComputedStateResult", () => {
  it("hideCompleted/collapsed/computed/action の公開 shape を組み立てる", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();
    const collapsedItemIds = new Set<string>();

    expect(
      createTodoListDetailComputedStateResult({
        detailProgress: {
          progress: { completed: 1, total: 2, percentage: 50 },
        },
        detailVisibleItems: {
          visibleItems: [{ id: "item-1" } as never],
        },
        detailVisibility: {
          collapsedItemIds,
          hideCompleted: true,
          toggleCollapseItem,
          toggleHideCompleted,
        },
      }),
    ).toEqual({
      collapsedItemIds,
      hideCompleted: true,
      progress: { completed: 1, total: 2, percentage: 50 },
      toggleCollapseItem,
      toggleHideCompleted,
      visibleItems: [{ id: "item-1" }],
    });
  });

  it("toggleCollapseItem と toggleHideCompleted が渡した参照のまま result にマッピングされる", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 0, percentage: 0 } },
      detailVisibleItems: { visibleItems: [] },
      detailVisibility: {
        collapsedItemIds: new Set<string>(),
        hideCompleted: false,
        toggleCollapseItem,
        toggleHideCompleted,
      },
    });

    expect(result.toggleCollapseItem).toBe(toggleCollapseItem);
    expect(result.toggleHideCompleted).toBe(toggleHideCompleted);
  });

  it("collapsedItemIds を visibility からそのまま伝播する（参照同一性）", () => {
    const collapsedItemIds = new Set<string>(["item-1", "item-2"]);
    const toggleCollapseItem = jest.fn();
    const toggleHideCompleted = jest.fn();

    const result = createTodoListDetailComputedStateResult({
      detailProgress: { progress: { completed: 0, total: 1, percentage: 0 } },
      detailVisibleItems: { visibleItems: [] },
      detailVisibility: {
        collapsedItemIds,
        hideCompleted: false,
        toggleCollapseItem,
        toggleHideCompleted,
      },
    });

    expect(result.collapsedItemIds).toBe(collapsedItemIds);
  });
});
