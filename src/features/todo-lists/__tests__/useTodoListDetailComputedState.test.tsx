import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailComputedValues", () => ({
  useTodoListDetailComputedValues: jest.fn(),
}));

jest.mock("../useTodoListDetailVisibilityActions", () => ({
  useTodoListDetailVisibilityActions: jest.fn(),
}));

jest.mock("../useTodoListDetailVisibilityState", () => ({
  useTodoListDetailVisibilityState: jest.fn(),
}));

jest.mock("../todoListDetailComputedStateResult", () => ({
  createTodoListDetailComputedStateResult: jest.fn(),
}));

import { createTodoListDetailComputedStateResult } from "../todoListDetailComputedStateResult";
import { useTodoListDetailComputedValues } from "../useTodoListDetailComputedValues";
import { useTodoListDetailVisibilityActions } from "../useTodoListDetailVisibilityActions";
import { useTodoListDetailVisibilityState } from "../useTodoListDetailVisibilityState";
import { useTodoListDetailComputedState } from "../useTodoListDetailComputedState";

describe("useTodoListDetailComputedState", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailVisibilityState as jest.Mock).mockReturnValue({
      hideCompleted: false,
      setHideCompleted: jest.fn(),
    });
    (useTodoListDetailComputedValues as jest.Mock).mockReturnValue({
      progress: { completed: 1, total: 2, percentage: 50 },
      visibleItems: list.items,
    });
    (useTodoListDetailVisibilityActions as jest.Mock).mockReturnValue({
      toggleHideCompleted: jest.fn(),
    });
    (createTodoListDetailComputedStateResult as jest.Mock).mockReturnValue({
      computed: true,
    });
  });

  it("visibility state と計算値と action hook を合成する", () => {
    const { result } = renderHook(() =>
      useTodoListDetailComputedState({ list }),
    );

    expect(useTodoListDetailVisibilityState).toHaveBeenCalledWith();
    expect(useTodoListDetailComputedValues).toHaveBeenCalledWith({
      hideCompleted: false,
      list,
    });
    expect(useTodoListDetailVisibilityActions).toHaveBeenCalledWith({
      setHideCompleted: expect.any(Function),
    });
    expect(createTodoListDetailComputedStateResult).toHaveBeenCalledWith({
      computedValues: {
        progress: { completed: 1, total: 2, percentage: 50 },
        visibleItems: list.items,
      },
      visibilityActions: {
        toggleHideCompleted: (useTodoListDetailVisibilityActions as jest.Mock)
          .mock.results[0].value.toggleHideCompleted,
      },
      visibilityState: {
        hideCompleted: false,
        setHideCompleted: (useTodoListDetailVisibilityState as jest.Mock).mock
          .results[0].value.setHideCompleted,
      },
    });
    expect(result.current).toEqual({ computed: true });
  });
});
