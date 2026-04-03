import { createTodoListHideCompletedActionsResult } from "../todoListHideCompletedActionsResult";

describe("createTodoListHideCompletedActionsResult", () => {
  it("toggleHideCompleted action の公開 shape を返す", () => {
    const toggleHideCompleted = jest.fn();

    expect(
      createTodoListHideCompletedActionsResult({ toggleHideCompleted }),
    ).toEqual({ toggleHideCompleted });
  });
});
