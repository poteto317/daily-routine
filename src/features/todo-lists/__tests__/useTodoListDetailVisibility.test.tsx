import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListHideCompletedState", () => ({
  useTodoListHideCompletedState: jest.fn(),
}));

jest.mock("../useTodoListCollapsedItemsState", () => ({
  useTodoListCollapsedItemsState: jest.fn(),
}));

jest.mock("../useTodoListHideCompletedActions", () => ({
  useTodoListHideCompletedActions: jest.fn(),
}));

jest.mock("../useTodoListCollapseItemActions", () => ({
  useTodoListCollapseItemActions: jest.fn(),
}));

jest.mock("../todoListDetailVisibilityResult", () => ({
  createTodoListDetailVisibilityResult: jest.fn(),
}));

import { createTodoListDetailVisibilityResult } from "../todoListDetailVisibilityResult";
import { useTodoListCollapseItemActions } from "../useTodoListCollapseItemActions";
import { useTodoListCollapsedItemsState } from "../useTodoListCollapsedItemsState";
import { useTodoListDetailVisibility } from "../useTodoListDetailVisibility";
import { useTodoListHideCompletedActions } from "../useTodoListHideCompletedActions";
import { useTodoListHideCompletedState } from "../useTodoListHideCompletedState";

describe("useTodoListDetailVisibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListHideCompletedState as jest.Mock).mockReturnValue({
      hideCompleted: false,
      setHideCompleted: jest.fn(),
    });
    (useTodoListCollapsedItemsState as jest.Mock).mockReturnValue({
      collapsedItemIds: new Set<string>(),
      setCollapsedItemIds: jest.fn(),
    });
    (useTodoListHideCompletedActions as jest.Mock).mockReturnValue({
      toggleHideCompleted: jest.fn(),
    });
    (useTodoListCollapseItemActions as jest.Mock).mockReturnValue({
      toggleCollapseItem: jest.fn(),
    });
    (createTodoListDetailVisibilityResult as jest.Mock).mockReturnValue({
      detailVisibility: true,
    });
  });

  it("hide/collapse の state と action を合成して result に委譲する", () => {
    const { result } = renderHook(() => useTodoListDetailVisibility());

    expect(useTodoListHideCompletedState).toHaveBeenCalledWith();
    expect(useTodoListCollapsedItemsState).toHaveBeenCalledWith();
    expect(useTodoListHideCompletedActions).toHaveBeenCalledWith({
      setHideCompleted: (useTodoListHideCompletedState as jest.Mock).mock
        .results[0].value.setHideCompleted,
    });
    expect(useTodoListCollapseItemActions).toHaveBeenCalledWith({
      setCollapsedItemIds: (useTodoListCollapsedItemsState as jest.Mock).mock
        .results[0].value.setCollapsedItemIds,
    });
    expect(createTodoListDetailVisibilityResult).toHaveBeenCalledWith({
      hideCompletedActions: {
        toggleHideCompleted: (useTodoListHideCompletedActions as jest.Mock).mock
          .results[0].value.toggleHideCompleted,
      },
      collapseItemActions: {
        toggleCollapseItem: (useTodoListCollapseItemActions as jest.Mock).mock
          .results[0].value.toggleCollapseItem,
      },
      hideCompletedState: {
        hideCompleted: false,
        setHideCompleted: (useTodoListHideCompletedState as jest.Mock).mock
          .results[0].value.setHideCompleted,
      },
      collapsedItemsState: {
        collapsedItemIds: expect.any(Set),
        setCollapsedItemIds: (useTodoListCollapsedItemsState as jest.Mock).mock
          .results[0].value.setCollapsedItemIds,
      },
    });
    expect(result.current).toEqual({ detailVisibility: true });
  });
});
