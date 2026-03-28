import { createTodoListDetailVisibilityActionsResult } from "../todoListDetailVisibilityActionsResult";

describe("createTodoListDetailVisibilityActionsResult", () => {
  it("toggle action の公開 shape を返す", () => {
    const toggleHideCompleted = jest.fn();

    expect(
      createTodoListDetailVisibilityActionsResult({
        toggleHideCompleted,
      }),
    ).toEqual({
      toggleHideCompleted,
    });
  });
});
