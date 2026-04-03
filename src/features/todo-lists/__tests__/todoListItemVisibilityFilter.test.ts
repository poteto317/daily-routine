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

  it("hideCompleted=true では元の items に collapse を適用しつつ非表示になる completed 親の collapse は無視する", () => {
    const items = [{ id: "open-parent" }, { id: "completed-parent" }];
    const afterIncomplete = [{ id: "open-parent" }];
    const afterCollapse = [{ id: "open-parent" }, { id: "completed-parent" }];
    (filterIncompleteItems as jest.Mock).mockReturnValue(afterIncomplete);
    (filterCollapsedItems as jest.Mock).mockReturnValue(afterCollapse);

    expect(
      getVisibleTodoItems(
        items as never[],
        true,
        new Set(["open-parent", "completed-parent"]),
      ),
    ).toEqual([afterCollapse[0]]);
    expect(filterIncompleteItems).toHaveBeenCalledWith(items);
    expect(filterCollapsedItems).toHaveBeenCalledWith(items, expect.any(Set));
    expect((filterCollapsedItems as jest.Mock).mock.calls[0][1]).toEqual(
      new Set(["open-parent"]),
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
