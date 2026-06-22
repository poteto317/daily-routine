import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListMoveCompletedToBottomState", () => ({
  useTodoListMoveCompletedToBottomState: jest.fn(),
}));

jest.mock("../useTodoListMoveCompletedToBottomActions", () => ({
  useTodoListMoveCompletedToBottomActions: jest.fn(),
}));

jest.mock("../todoListDetailItemOrderResult", () => ({
  createTodoListDetailItemOrderResult: jest.fn(),
}));

import { createTodoListDetailItemOrderResult } from "../todoListDetailItemOrderResult";
import { useTodoListMoveCompletedToBottomActions } from "../useTodoListMoveCompletedToBottomActions";
import { useTodoListMoveCompletedToBottomState } from "../useTodoListMoveCompletedToBottomState";
import { useTodoListDetailItemOrder } from "../useTodoListDetailItemOrder";

describe("useTodoListDetailItemOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListMoveCompletedToBottomState as jest.Mock).mockReturnValue({
      moveCompletedToBottom: false,
      setMoveCompletedToBottom: jest.fn(),
    });
    (useTodoListMoveCompletedToBottomActions as jest.Mock).mockReturnValue({
      toggleMoveCompletedToBottom: jest.fn(),
    });
    (createTodoListDetailItemOrderResult as jest.Mock).mockReturnValue({
      itemOrder: true,
    });
  });

  it("moveCompletedToBottom の state と action を合成して result に委譲する", () => {
    const { result } = renderHook(() => useTodoListDetailItemOrder());

    expect(useTodoListMoveCompletedToBottomState).toHaveBeenCalledWith();
    expect(useTodoListMoveCompletedToBottomActions).toHaveBeenCalledWith({
      setMoveCompletedToBottom: (
        useTodoListMoveCompletedToBottomState as jest.Mock
      ).mock.results[0].value.setMoveCompletedToBottom,
    });
    expect(createTodoListDetailItemOrderResult).toHaveBeenCalledWith({
      moveCompletedToBottomState: {
        moveCompletedToBottom: false,
        setMoveCompletedToBottom: (
          useTodoListMoveCompletedToBottomState as jest.Mock
        ).mock.results[0].value.setMoveCompletedToBottom,
      },
      moveCompletedToBottomActions: {
        toggleMoveCompletedToBottom: (
          useTodoListMoveCompletedToBottomActions as jest.Mock
        ).mock.results[0].value.toggleMoveCompletedToBottom,
      },
    });
    expect(result.current).toEqual({ itemOrder: true });
  });
});
