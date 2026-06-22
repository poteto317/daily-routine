import { createTodoListMoveCompletedToBottomActionsResult } from "../todoListMoveCompletedToBottomActionsResult";

describe("createTodoListMoveCompletedToBottomActionsResult", () => {
  it("toggleMoveCompletedToBottom action の公開 shape を返す", () => {
    const toggleMoveCompletedToBottom = jest.fn();

    expect(
      createTodoListMoveCompletedToBottomActionsResult({
        toggleMoveCompletedToBottom,
      }),
    ).toEqual({ toggleMoveCompletedToBottom });
  });
});
