import { renderHook } from "@testing-library/react";
import { createTodoListDetailVisibleItemsResult } from "../todoListDetailVisibleItemsResult";
import { getVisibleTodoItems } from "../todoListItemVisibilityFilter";
import { useTodoListDetailVisibleItems } from "../useTodoListDetailVisibleItems";

jest.mock("../todoListDetailVisibleItemsResult", () => ({
  createTodoListDetailVisibleItemsResult: jest.fn(),
}));

jest.mock("../todoListItemVisibilityFilter", () => ({
  ...jest.requireActual("../todoListItemVisibilityFilter"),
  getVisibleTodoItems: jest.fn(),
}));

describe("useTodoListDetailVisibleItems", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [
      {
        id: "parent",
        title: "Parent",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
        indent: 0,
      },
      {
        id: "child-done",
        title: "Child Done",
        isCompleted: true,
        createdAt: "2026-03-07T00:00:00.000Z",
        indent: 1,
      },
      {
        id: "child-open",
        title: "Child Open",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
        indent: 1,
      },
      {
        id: "sibling",
        title: "Sibling",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
        indent: 0,
      },
    ],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListItemVisibilityFilter")
    >("../todoListItemVisibilityFilter");
    (getVisibleTodoItems as jest.Mock).mockImplementation(
      real.getVisibleTodoItems,
    );
    (createTodoListDetailVisibleItemsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("hideCompleted に応じて filteredItems を計算する", () => {
    const { result, rerender } = renderHook(
      ({ hideCompleted }) =>
        useTodoListDetailVisibleItems({
          hideCompleted,
          collapsedItemIds: new Set<string>(),
          list,
        }),
      {
        initialProps: { hideCompleted: false },
      },
    );

    expect(result.current.filteredItems.map((item) => item.id)).toEqual([
      "parent",
      "child-done",
      "child-open",
      "sibling",
    ]);

    rerender({ hideCompleted: true });

    expect(result.current.filteredItems.map((item) => item.id)).toEqual([
      "parent",
      "child-open",
      "sibling",
    ]);
  });

  it("collapsedItemIds に応じて filteredItems を計算する", () => {
    const { result } = renderHook(() =>
      useTodoListDetailVisibleItems({
        hideCompleted: false,
        collapsedItemIds: new Set(["parent"]),
        list,
      }),
    );

    expect(createTodoListDetailVisibleItemsResult).toHaveBeenCalledWith({
      filteredItems: [
        expect.objectContaining({ id: "parent" }),
        expect.objectContaining({ id: "sibling" }),
      ],
    });
    expect(result.current.filteredItems.map((item) => item.id)).toEqual([
      "parent",
      "sibling",
    ]);
  });

  it("getVisibleTodoItems に items / hideCompleted / collapsedItemIds を渡して委譲する", () => {
    const collapsedItemIds = new Set(["parent"]);
    const mockFiltered = [list.items[0]];
    (getVisibleTodoItems as jest.Mock).mockReturnValue(mockFiltered);

    renderHook(() =>
      useTodoListDetailVisibleItems({
        hideCompleted: true,
        collapsedItemIds,
        list,
      }),
    );

    expect(getVisibleTodoItems).toHaveBeenCalledWith(
      list.items,
      true,
      collapsedItemIds,
    );
    expect(createTodoListDetailVisibleItemsResult).toHaveBeenCalledWith({
      filteredItems: mockFiltered,
    });
  });
});
