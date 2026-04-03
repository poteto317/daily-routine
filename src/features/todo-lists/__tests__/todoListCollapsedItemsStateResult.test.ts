import { createTodoListCollapsedItemsStateResult } from "../todoListCollapsedItemsStateResult";

describe("createTodoListCollapsedItemsStateResult", () => {
  it("collapsedItemIds state の公開 shape を返す", () => {
    const collapsedItemIds = new Set<string>(["item-1", "item-2"]);
    const setCollapsedItemIds = jest.fn();

    expect(
      createTodoListCollapsedItemsStateResult({
        collapsedItemIds,
        setCollapsedItemIds,
      }),
    ).toEqual({
      collapsedItemIds,
      setCollapsedItemIds,
    });
  });

  it("空の Set の場合もそのまま返す", () => {
    const collapsedItemIds = new Set<string>();
    const setCollapsedItemIds = jest.fn();

    const result = createTodoListCollapsedItemsStateResult({
      collapsedItemIds,
      setCollapsedItemIds,
    });

    expect(result.collapsedItemIds.size).toBe(0);
    expect(result.setCollapsedItemIds).toBe(setCollapsedItemIds);
  });
});
