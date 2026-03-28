import { createTodoListDetailComputedValuesResult } from "../todoListDetailComputedValuesResult";

describe("createTodoListDetailComputedValuesResult", () => {
  it("computed values の公開 shape を返す", () => {
    const visibleItems = [
      {
        id: "item-1",
        title: "Task 1",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ];

    expect(
      createTodoListDetailComputedValuesResult({
        progress: { completed: 1, total: 2, percentage: 50 },
        visibleItems,
      }),
    ).toEqual({
      progress: { completed: 1, total: 2, percentage: 50 },
      visibleItems,
    });
  });
});
