import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";

describe("todoListDetailComputedStateResult", () => {
  it("visibility/computed/action の公開 shape を組み立てる", () => {
    const toggleHideCompleted = jest.fn();

    expect(
      createTodoListDetailComputedStateResult({
        computedValues: {
          progress: { completed: 1, total: 2, percentage: 50 },
          visibleItems: [{ id: "item-1" } as never],
        },
        visibilityActions: {
          toggleHideCompleted,
        },
        visibilityState: {
          hideCompleted: true,
          setHideCompleted: jest.fn(),
        },
      }),
    ).toEqual({
      hideCompleted: true,
      progress: { completed: 1, total: 2, percentage: 50 },
      toggleHideCompleted,
      visibleItems: [{ id: "item-1" }],
    });
  });
});
