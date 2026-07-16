import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailOrderedItemsResult", () => ({
  createTodoListDetailOrderedItemsResult: jest.fn(),
}));

jest.mock("../todoListCompletedToBottomSort", () => ({
  sortCompletedToBottom: jest.fn((items) => items),
}));

jest.mock("../todoListCategoryGroupSort", () => ({
  groupItemsByCategory: jest.fn((items) => items),
}));

import { createTodoListDetailOrderedItemsResult } from "../todoListDetailOrderedItemsResult";
import { sortCompletedToBottom } from "../todoListCompletedToBottomSort";
import { groupItemsByCategory } from "../todoListCategoryGroupSort";
import { useTodoListDetailOrderedItems } from "../useTodoListDetailOrderedItems";

describe("useTodoListDetailOrderedItems", () => {
  const filteredItems = [
    { id: "a", isCompleted: false } as never,
    { id: "b", isCompleted: true } as never,
  ];
  const categoryLookup = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (createTodoListDetailOrderedItemsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
    (sortCompletedToBottom as jest.Mock).mockImplementation((items) => items);
    (groupItemsByCategory as jest.Mock).mockImplementation((items) => items);
  });

  it("moveCompletedToBottom=true かつ groupByCategory=false のとき sortCompletedToBottom を適用して result に委譲する", () => {
    const sorted = [filteredItems[0]];
    (sortCompletedToBottom as jest.Mock).mockReturnValue(sorted);

    renderHook(() =>
      useTodoListDetailOrderedItems({
        filteredItems,
        moveCompletedToBottom: true,
        groupByCategory: false,
        categoryLookup,
      }),
    );

    expect(sortCompletedToBottom).toHaveBeenCalledWith(filteredItems);
    expect(groupItemsByCategory).not.toHaveBeenCalled();
    expect(createTodoListDetailOrderedItemsResult).toHaveBeenCalledWith({
      visibleItems: sorted,
    });
  });

  it("moveCompletedToBottom=false かつ groupByCategory=false のとき何も適用せず filteredItems をそのまま result に委譲する", () => {
    renderHook(() =>
      useTodoListDetailOrderedItems({
        filteredItems,
        moveCompletedToBottom: false,
        groupByCategory: false,
        categoryLookup,
      }),
    );

    expect(sortCompletedToBottom).not.toHaveBeenCalled();
    expect(groupItemsByCategory).not.toHaveBeenCalled();
    expect(createTodoListDetailOrderedItemsResult).toHaveBeenCalledWith({
      visibleItems: filteredItems,
    });
  });

  it("moveCompletedToBottom が変わると再計算される", () => {
    const sorted = [filteredItems[0]];
    (sortCompletedToBottom as jest.Mock).mockReturnValue(sorted);

    const { rerender } = renderHook(
      ({ moveCompletedToBottom }) =>
        useTodoListDetailOrderedItems({
          filteredItems,
          moveCompletedToBottom,
          groupByCategory: false,
          categoryLookup,
        }),
      { initialProps: { moveCompletedToBottom: false } },
    );

    expect(sortCompletedToBottom).not.toHaveBeenCalled();

    rerender({ moveCompletedToBottom: true });

    expect(sortCompletedToBottom).toHaveBeenCalledWith(filteredItems);
  });

  describe("groupByCategory=true のとき", () => {
    it("sortCompletedToBottom を呼ばず groupItemsByCategory へ委譲する", () => {
      const grouped = [filteredItems[1]];
      (groupItemsByCategory as jest.Mock).mockReturnValue(grouped);

      renderHook(() =>
        useTodoListDetailOrderedItems({
          filteredItems,
          moveCompletedToBottom: false,
          groupByCategory: true,
          categoryLookup,
        }),
      );

      expect(sortCompletedToBottom).not.toHaveBeenCalled();
      expect(groupItemsByCategory).toHaveBeenCalledWith(
        filteredItems,
        categoryLookup,
        { sortCompletedToBottomWithinGroup: false },
      );
      expect(createTodoListDetailOrderedItemsResult).toHaveBeenCalledWith({
        visibleItems: grouped,
      });
    });

    it("moveCompletedToBottomも同時にtrueの場合、グループ内完了ソートを有効にしてgroupItemsByCategoryへ委譲する（グループを跨がない）", () => {
      renderHook(() =>
        useTodoListDetailOrderedItems({
          filteredItems,
          moveCompletedToBottom: true,
          groupByCategory: true,
          categoryLookup,
        }),
      );

      expect(sortCompletedToBottom).not.toHaveBeenCalled();
      expect(groupItemsByCategory).toHaveBeenCalledWith(
        filteredItems,
        categoryLookup,
        { sortCompletedToBottomWithinGroup: true },
      );
    });

    it("categoryLookupが変わると再計算される", () => {
      const { rerender } = renderHook(
        ({ categoryLookup }) =>
          useTodoListDetailOrderedItems({
            filteredItems,
            moveCompletedToBottom: false,
            groupByCategory: true,
            categoryLookup,
          }),
        { initialProps: { categoryLookup } },
      );

      expect(groupItemsByCategory).toHaveBeenCalledTimes(1);

      const nextLookup = new Map([["cat-1", { id: "cat-1" } as never]]);
      rerender({ categoryLookup: nextLookup });

      expect(groupItemsByCategory).toHaveBeenCalledTimes(2);
      expect(groupItemsByCategory).toHaveBeenLastCalledWith(
        filteredItems,
        nextLookup,
        { sortCompletedToBottomWithinGroup: false },
      );
    });
  });
});
