import { renderHook } from "@testing-library/react";

jest.mock("../todoListCollapseToggleHandler", () => ({
  createCollapseToggleHandler: jest.fn(),
}));

jest.mock("../todoListCollapseActionsResult", () => ({
  createTodoListCollapseActionsResult: jest.fn(),
}));

import { createTodoListCollapseActionsResult } from "../todoListCollapseActionsResult";
import { createCollapseToggleHandler } from "../todoListCollapseToggleHandler";
import { useTodoListCollapseItemActions } from "../useTodoListCollapseItemActions";

describe("useTodoListCollapseItemActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createCollapseToggleHandler as jest.Mock).mockReturnValue(jest.fn());
    (createTodoListCollapseActionsResult as jest.Mock).mockReturnValue({
      collapseItemActions: true,
    });
  });

  it("collapse toggle handler を作って result helper に委譲する", () => {
    const setCollapsedItemIds = jest.fn();

    const { result, rerender } = renderHook(() =>
      useTodoListCollapseItemActions({ setCollapsedItemIds }),
    );

    rerender();

    expect(createCollapseToggleHandler).toHaveBeenCalledTimes(1);
    expect(createCollapseToggleHandler).toHaveBeenCalledWith(
      setCollapsedItemIds,
    );
    expect(createTodoListCollapseActionsResult).toHaveBeenCalledTimes(2);
    expect(createTodoListCollapseActionsResult).toHaveBeenCalledWith({
      toggleCollapseItem: (createCollapseToggleHandler as jest.Mock).mock
        .results[0].value,
    });
    expect(result.current).toEqual({ collapseItemActions: true });
  });
});
