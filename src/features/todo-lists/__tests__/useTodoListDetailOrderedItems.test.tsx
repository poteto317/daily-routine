import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailOrderedItemsResult", () => ({
  createTodoListDetailOrderedItemsResult: jest.fn(),
}));

jest.mock("../todoListCategoryGroupWithCompletedAtEndSort", () => ({
  groupItemsByCategoryWithCompletedAtEnd: jest.fn((items) => items),
}));

import { createTodoListDetailOrderedItemsResult } from "../todoListDetailOrderedItemsResult";
import { groupItemsByCategoryWithCompletedAtEnd } from "../todoListCategoryGroupWithCompletedAtEndSort";
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
    (groupItemsByCategoryWithCompletedAtEnd as jest.Mock).mockImplementation(
      (items) => items,
    );
  });

  it("常にgroupItemsByCategoryWithCompletedAtEndを適用してresultに委譲する（トグルによる分岐は存在しない）", () => {
    const grouped = [filteredItems[1]];
    (groupItemsByCategoryWithCompletedAtEnd as jest.Mock).mockReturnValue(
      grouped,
    );

    renderHook(() =>
      useTodoListDetailOrderedItems({
        filteredItems,
        categoryLookup,
      }),
    );

    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenCalledWith(
      filteredItems,
      categoryLookup,
    );
    expect(createTodoListDetailOrderedItemsResult).toHaveBeenCalledWith({
      visibleItems: grouped,
    });
  });

  it("filteredItemsが変わると再計算される", () => {
    const { rerender } = renderHook(
      ({ filteredItems }) =>
        useTodoListDetailOrderedItems({
          filteredItems,
          categoryLookup,
        }),
      { initialProps: { filteredItems } },
    );

    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenCalledTimes(1);

    const nextItems = [filteredItems[0]];
    rerender({ filteredItems: nextItems });

    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenCalledTimes(2);
    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenLastCalledWith(
      nextItems,
      categoryLookup,
    );
  });

  it("categoryLookupが変わると再計算される", () => {
    const { rerender } = renderHook(
      ({ categoryLookup }) =>
        useTodoListDetailOrderedItems({
          filteredItems,
          categoryLookup,
        }),
      { initialProps: { categoryLookup } },
    );

    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenCalledTimes(1);

    const nextLookup = new Map([["cat-1", { id: "cat-1" } as never]]);
    rerender({ categoryLookup: nextLookup });

    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenCalledTimes(2);
    expect(groupItemsByCategoryWithCompletedAtEnd).toHaveBeenLastCalledWith(
      filteredItems,
      nextLookup,
    );
  });
});
