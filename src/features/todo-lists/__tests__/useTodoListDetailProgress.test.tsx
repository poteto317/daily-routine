import { renderHook } from "@testing-library/react";
import { getListProgress } from "../todoListProgress";
import { createTodoListDetailProgressResult } from "../todoListDetailProgressResult";
import { useTodoListDetailProgress } from "../useTodoListDetailProgress";

jest.mock("../todoListDetailProgressResult", () => ({
  createTodoListDetailProgressResult: jest.fn(),
}));

jest.mock("../todoListProgress", () => ({
  ...jest.requireActual("../todoListProgress"),
  getListProgress: jest.fn(),
}));

describe("useTodoListDetailProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<typeof import("../todoListProgress")>(
      "../todoListProgress",
    );
    (getListProgress as jest.Mock).mockImplementation(real.getListProgress);
    (createTodoListDetailProgressResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("list から progress を計算して result helper に委譲する", () => {
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [
        {
          id: "item-1",
          title: "Task 1",
          isCompleted: true,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "item-2",
          title: "Task 2",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };

    const { result } = renderHook(() => useTodoListDetailProgress({ list }));

    expect(createTodoListDetailProgressResult).toHaveBeenCalledWith({
      progress: { completed: 1, total: 2, percentage: 50 },
    });
    expect(result.current.progress).toEqual({
      completed: 1,
      total: 2,
      percentage: 50,
    });
  });

  it("list が変わると progress も更新される", () => {
    const { result, rerender } = renderHook(
      ({ completed }) =>
        useTodoListDetailProgress({
          list: {
            id: "list-1",
            title: "Inbox",
            items: [
              {
                id: "item-1",
                title: "Task 1",
                isCompleted: completed,
                createdAt: "2026-03-07T00:00:00.000Z",
              },
            ],
            createdAt: "2026-03-07T00:00:00.000Z",
            updatedAt: "2026-03-07T00:00:00.000Z",
          },
        }),
      {
        initialProps: { completed: false },
      },
    );

    expect(result.current.progress).toEqual({
      completed: 0,
      total: 1,
      percentage: 0,
    });

    rerender({ completed: true });

    expect(result.current.progress).toEqual({
      completed: 1,
      total: 1,
      percentage: 100,
    });
  });

  it("getListProgress に list を渡して委譲する", () => {
    const mockProgress = { completed: 3, total: 5, percentage: 60 };
    (getListProgress as jest.Mock).mockReturnValue(mockProgress);

    const list = {
      id: "list-2",
      title: "Work",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };

    renderHook(() => useTodoListDetailProgress({ list }));

    expect(getListProgress).toHaveBeenCalledWith(list);
    expect(createTodoListDetailProgressResult).toHaveBeenCalledWith({
      progress: mockProgress,
    });
  });
});
