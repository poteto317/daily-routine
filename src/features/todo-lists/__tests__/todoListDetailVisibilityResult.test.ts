import { createTodoListDetailVisibilityResult } from "../todoListDetailVisibilityResult";

describe("createTodoListDetailVisibilityResult", () => {
  it("visibility の公開 shape を返す", () => {
    const toggleHideCompleted = jest.fn();
    const toggleCollapseItem = jest.fn();
    const collapsedItemIds = new Set<string>(["item-1"]);

    expect(
      createTodoListDetailVisibilityResult({
        hideCompletedActions: { toggleHideCompleted },
        collapseItemActions: { toggleCollapseItem },
        hideCompletedState: {
          hideCompleted: true,
          setHideCompleted: jest.fn(),
        },
        collapsedItemsState: {
          collapsedItemIds,
          setCollapsedItemIds: jest.fn(),
        },
      }),
    ).toEqual({
      collapsedItemIds,
      hideCompleted: true,
      toggleCollapseItem,
      toggleHideCompleted,
    });
  });
});
