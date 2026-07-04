import { createTodoListDetailCollapsedItemsResult } from "../todoListDetailCollapsedItemsResult";

describe("createTodoListDetailCollapsedItemsResult", () => {
  it("collapsedItemIds/toggleCollapseItem の公開 shape を返す", () => {
    const toggleCollapseItem = jest.fn();
    const collapsedItemIds = new Set<string>(["item-1"]);

    expect(
      createTodoListDetailCollapsedItemsResult({
        collapsedItemsState: {
          collapsedItemIds,
          setCollapsedItemIds: jest.fn(),
        },
        collapseItemActions: { toggleCollapseItem },
      }),
    ).toEqual({
      collapsedItemIds,
      toggleCollapseItem,
    });
  });

  it("collapsedItemIds を参照同一性のまま伝播する", () => {
    const collapsedItemIds = new Set<string>(["item-1", "item-2"]);

    const result = createTodoListDetailCollapsedItemsResult({
      collapsedItemsState: { collapsedItemIds, setCollapsedItemIds: jest.fn() },
      collapseItemActions: { toggleCollapseItem: jest.fn() },
    });

    expect(result.collapsedItemIds).toBe(collapsedItemIds);
  });

  it("toggleCollapseItem を参照同一性のまま伝播する", () => {
    const toggleCollapseItem = jest.fn();

    const result = createTodoListDetailCollapsedItemsResult({
      collapsedItemsState: {
        collapsedItemIds: new Set<string>(),
        setCollapsedItemIds: jest.fn(),
      },
      collapseItemActions: { toggleCollapseItem },
    });

    expect(result.toggleCollapseItem).toBe(toggleCollapseItem);
  });
});
