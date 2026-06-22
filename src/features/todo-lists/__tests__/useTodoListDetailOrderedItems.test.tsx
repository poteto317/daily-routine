import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailOrderedItemsResult", () => ({
  createTodoListDetailOrderedItemsResult: jest.fn(),
}));

jest.mock("../todoListCompletedToBottomSort", () => ({
  sortCompletedToBottom: jest.fn((items) => items),
}));

import { createTodoListDetailOrderedItemsResult } from "../todoListDetailOrderedItemsResult";
import { sortCompletedToBottom } from "../todoListCompletedToBottomSort";
import { useTodoListDetailOrderedItems } from "../useTodoListDetailOrderedItems";

describe("useTodoListDetailOrderedItems", () => {
  const filteredItems = [
    { id: "a", isCompleted: false } as never,
    { id: "b", isCompleted: true } as never,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (createTodoListDetailOrderedItemsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
    (sortCompletedToBottom as jest.Mock).mockImplementation((items) => items);
  });

  it("moveCompletedToBottom=true のとき sortCompletedToBottom を適用して result に委譲する", () => {
    const sorted = [filteredItems[0]];
    (sortCompletedToBottom as jest.Mock).mockReturnValue(sorted);

    renderHook(() =>
      useTodoListDetailOrderedItems({
        filteredItems,
        moveCompletedToBottom: true,
      }),
    );

    expect(sortCompletedToBottom).toHaveBeenCalledWith(filteredItems);
    expect(createTodoListDetailOrderedItemsResult).toHaveBeenCalledWith({
      visibleItems: sorted,
    });
  });

  it("moveCompletedToBottom=false のとき sortCompletedToBottom を呼ばず filteredItems をそのまま result に委譲する", () => {
    renderHook(() =>
      useTodoListDetailOrderedItems({
        filteredItems,
        moveCompletedToBottom: false,
      }),
    );

    expect(sortCompletedToBottom).not.toHaveBeenCalled();
    expect(createTodoListDetailOrderedItemsResult).toHaveBeenCalledWith({
      visibleItems: filteredItems,
    });
  });

  it("moveCompletedToBottom が変わると再計算される", () => {
    const sorted = [filteredItems[0]];
    (sortCompletedToBottom as jest.Mock).mockReturnValue(sorted);

    const { rerender } = renderHook(
      ({ moveCompletedToBottom }) =>
        useTodoListDetailOrderedItems({ filteredItems, moveCompletedToBottom }),
      { initialProps: { moveCompletedToBottom: false } },
    );

    expect(sortCompletedToBottom).not.toHaveBeenCalled();

    rerender({ moveCompletedToBottom: true });

    expect(sortCompletedToBottom).toHaveBeenCalledWith(filteredItems);
  });
});
