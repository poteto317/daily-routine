import { renderHook } from "@testing-library/react";
import { createTodoListDetailComputedValuesResult } from "../todoListDetailComputedValuesResult";
import { useTodoListDetailComputedValues } from "../useTodoListDetailComputedValues";

jest.mock("../todoListDetailComputedValuesResult", () => ({
  createTodoListDetailComputedValuesResult: jest.fn(),
}));

describe("useTodoListDetailComputedValues", () => {
  const list = {
    id: "list-1",
    title: "Inbox",
    items: [
      {
        id: "item-1",
        title: "Task 1",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
      {
        id: "item-2",
        title: "Done Task",
        isCompleted: true,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };

  it("progress と visibleItems を計算する", () => {
    (createTodoListDetailComputedValuesResult as jest.Mock).mockImplementation(
      (args) => args,
    );

    const { result, rerender } = renderHook(
      ({ hideCompleted }) =>
        useTodoListDetailComputedValues({
          hideCompleted,
          list,
        }),
      {
        initialProps: { hideCompleted: false },
      },
    );

    expect(createTodoListDetailComputedValuesResult).toHaveBeenCalledWith({
      progress: { completed: 1, total: 2, percentage: 50 },
      visibleItems: list.items,
    });
    expect(result.current.progress.completed).toBe(1);
    expect(result.current.progress.total).toBe(2);
    expect(result.current.visibleItems).toHaveLength(2);

    rerender({ hideCompleted: true });

    expect(result.current.visibleItems).toEqual([
      expect.objectContaining({ id: "item-1" }),
    ]);
    expect(createTodoListDetailComputedValuesResult).toHaveBeenLastCalledWith({
      progress: { completed: 1, total: 2, percentage: 50 },
      visibleItems: [expect.objectContaining({ id: "item-1" })],
    });
  });
});
