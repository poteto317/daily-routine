import { createTodoListDetailVisibilityStateResult } from "../todoListDetailVisibilityStateResult";

describe("createTodoListDetailVisibilityStateResult", () => {
  it("visibility state の公開 shape を返す", () => {
    const setHideCompleted = jest.fn();

    expect(
      createTodoListDetailVisibilityStateResult({
        hideCompleted: true,
        setHideCompleted,
      }),
    ).toEqual({
      hideCompleted: true,
      setHideCompleted,
    });
  });
});
