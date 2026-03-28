import { act, renderHook } from "@testing-library/react";
import { createTodoListDetailVisibilityStateResult } from "../todoListDetailVisibilityStateResult";
import { useTodoListDetailVisibilityState } from "../useTodoListDetailVisibilityState";

jest.mock("../todoListDetailVisibilityStateResult", () => ({
  createTodoListDetailVisibilityStateResult: jest.fn(),
}));

describe("useTodoListDetailVisibilityState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createTodoListDetailVisibilityStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("完了非表示 state を管理し result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListDetailVisibilityState());

    expect(createTodoListDetailVisibilityStateResult).toHaveBeenCalledWith({
      hideCompleted: false,
      setHideCompleted: expect.any(Function),
    });

    expect(result.current.hideCompleted).toBe(false);

    act(() => {
      result.current.setHideCompleted(true);
    });

    expect(result.current.hideCompleted).toBe(true);
    expect(createTodoListDetailVisibilityStateResult).toHaveBeenLastCalledWith({
      hideCompleted: true,
      setHideCompleted: expect.any(Function),
    });
  });
});
