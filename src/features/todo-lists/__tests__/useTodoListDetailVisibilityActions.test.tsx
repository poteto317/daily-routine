import { renderHook } from "@testing-library/react";

jest.mock("../todoListPageViewActions", () => ({
  createCompletedVisibilityToggleHandler: jest.fn(),
}));

jest.mock("../todoListDetailVisibilityActionsResult", () => ({
  createTodoListDetailVisibilityActionsResult: jest.fn(),
}));

import { createTodoListDetailVisibilityActionsResult } from "../todoListDetailVisibilityActionsResult";
import { createCompletedVisibilityToggleHandler } from "../todoListPageViewActions";
import { useTodoListDetailVisibilityActions } from "../useTodoListDetailVisibilityActions";

describe("useTodoListDetailVisibilityActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createCompletedVisibilityToggleHandler as jest.Mock).mockReturnValue(
      jest.fn(),
    );
    (createTodoListDetailVisibilityActionsResult as jest.Mock).mockReturnValue({
      visibilityActions: true,
    });
  });

  it("toggle handler を作って result helper に委譲する", () => {
    const setHideCompleted = jest.fn();

    const { result, rerender } = renderHook(() =>
      useTodoListDetailVisibilityActions({
        setHideCompleted,
      }),
    );

    rerender();

    expect(createCompletedVisibilityToggleHandler).toHaveBeenCalledTimes(1);
    expect(createCompletedVisibilityToggleHandler).toHaveBeenCalledWith(
      setHideCompleted,
    );
    expect(createTodoListDetailVisibilityActionsResult).toHaveBeenCalledTimes(
      2,
    );
    expect(createTodoListDetailVisibilityActionsResult).toHaveBeenNthCalledWith(
      1,
      {
        toggleHideCompleted: (
          createCompletedVisibilityToggleHandler as jest.Mock
        ).mock.results[0].value,
      },
    );
    expect(createTodoListDetailVisibilityActionsResult).toHaveBeenNthCalledWith(
      2,
      {
        toggleHideCompleted: (
          createCompletedVisibilityToggleHandler as jest.Mock
        ).mock.results[0].value,
      },
    );
    expect(result.current).toEqual({ visibilityActions: true });
  });
});
