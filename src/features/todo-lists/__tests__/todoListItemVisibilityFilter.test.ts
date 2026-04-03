jest.mock("../todoListCollapsedItemsFilter", () => ({
  filterCollapsedItems: jest.fn(),
}));

jest.mock("../todoListIncompleteItemsFilter", () => ({
  filterIncompleteItems: jest.fn(),
}));

import { filterCollapsedItems } from "../todoListCollapsedItemsFilter";
import { filterIncompleteItems } from "../todoListIncompleteItemsFilter";
import { getVisibleTodoItems } from "../todoListItemVisibilityFilter";

describe("getVisibleTodoItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hideCompleted=false では折りたたみフィルタ結果をそのまま返す", () => {
    const items = [{ id: "item-1" }];
    const collapsedItemIds = new Set(["parent"]);
    const afterCollapse = [{ id: "item-2" }];
    (filterCollapsedItems as jest.Mock).mockReturnValue(afterCollapse);

    expect(getVisibleTodoItems(items as never[], false, collapsedItemIds)).toBe(
      afterCollapse,
    );
    expect(filterCollapsedItems).toHaveBeenCalledWith(items, collapsedItemIds);
    expect(filterIncompleteItems).not.toHaveBeenCalled();
  });

  it("hideCompleted=true では未完了フィルタ後に折りたたみフィルタを適用する", () => {
    const items = [{ id: "item-1" }];
    const afterIncomplete = [{ id: "item-2" }];
    const afterCollapse = [{ id: "item-3" }];
    (filterIncompleteItems as jest.Mock).mockReturnValue(afterIncomplete);
    (filterCollapsedItems as jest.Mock).mockReturnValue(afterCollapse);

    expect(
      getVisibleTodoItems(items as never[], true, new Set(["parent"])),
    ).toBe(afterCollapse);
    expect(filterIncompleteItems).toHaveBeenCalledWith(items);
    expect(filterCollapsedItems).toHaveBeenCalledWith(
      afterIncomplete,
      new Set(["parent"]),
    );
  });

  it("collapsedItemIds 省略時は空の Set で折りたたみフィルタに委譲する", () => {
    const items = [{ id: "item-1" }];
    (filterCollapsedItems as jest.Mock).mockReturnValue(items);

    getVisibleTodoItems(items as never[], false);

    expect(filterCollapsedItems).toHaveBeenCalledWith(items, expect.any(Set));
    expect((filterCollapsedItems as jest.Mock).mock.calls[0][1].size).toBe(0);
  });
});
