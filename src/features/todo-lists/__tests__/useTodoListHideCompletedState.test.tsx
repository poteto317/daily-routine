import { act, renderHook } from "@testing-library/react";
import { createTodoListHideCompletedStateResult } from "../todoListHideCompletedStateResult";
import { useTodoListHideCompletedState } from "../useTodoListHideCompletedState";

jest.mock("../todoListHideCompletedStateResult", () => ({
  createTodoListHideCompletedStateResult: jest.fn(),
}));

describe("useTodoListHideCompletedState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createTodoListHideCompletedStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("hideCompleted state を管理し result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListHideCompletedState());

    expect(createTodoListHideCompletedStateResult).toHaveBeenCalledWith({
      hideCompleted: false,
      setHideCompleted: expect.any(Function),
    });
    expect(result.current.hideCompleted).toBe(false);
  });

  it("setHideCompleted で state を更新できる", () => {
    const { result } = renderHook(() => useTodoListHideCompletedState());

    act(() => {
      result.current.setHideCompleted(true);
    });

    expect(result.current.hideCompleted).toBe(true);
    expect(createTodoListHideCompletedStateResult).toHaveBeenLastCalledWith({
      hideCompleted: true,
      setHideCompleted: expect.any(Function),
    });
  });
});
