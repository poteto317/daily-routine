import { renderHook } from "@testing-library/react";

jest.mock("../todoListHideCompletedHandler", () => ({
  createCompletedVisibilityToggleHandler: jest.fn(),
}));

jest.mock("../todoListHideCompletedActionsResult", () => ({
  createTodoListHideCompletedActionsResult: jest.fn(),
}));

import { createTodoListHideCompletedActionsResult } from "../todoListHideCompletedActionsResult";
import { createCompletedVisibilityToggleHandler } from "../todoListHideCompletedHandler";
import { useTodoListHideCompletedActions } from "../useTodoListHideCompletedActions";

describe("useTodoListHideCompletedActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createCompletedVisibilityToggleHandler as jest.Mock).mockReturnValue(
      jest.fn(),
    );
    (createTodoListHideCompletedActionsResult as jest.Mock).mockReturnValue({
      hideCompletedActions: true,
    });
  });

  it("toggle handler を作って result helper に委譲する", () => {
    const setHideCompleted = jest.fn();

    const { result, rerender } = renderHook(() =>
      useTodoListHideCompletedActions({ setHideCompleted }),
    );

    rerender();

    expect(createCompletedVisibilityToggleHandler).toHaveBeenCalledTimes(1);
    expect(createCompletedVisibilityToggleHandler).toHaveBeenCalledWith(
      setHideCompleted,
    );
    expect(createTodoListHideCompletedActionsResult).toHaveBeenCalledTimes(2);
    expect(createTodoListHideCompletedActionsResult).toHaveBeenCalledWith({
      toggleHideCompleted: (createCompletedVisibilityToggleHandler as jest.Mock)
        .mock.results[0].value,
    });
    expect(result.current).toEqual({ hideCompletedActions: true });
  });
});
