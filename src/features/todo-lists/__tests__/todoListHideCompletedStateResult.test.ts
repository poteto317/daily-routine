import { createTodoListHideCompletedStateResult } from "../todoListHideCompletedStateResult";

describe("createTodoListHideCompletedStateResult", () => {
  it("hideCompleted state の公開 shape を返す", () => {
    const setHideCompleted = jest.fn();

    expect(
      createTodoListHideCompletedStateResult({
        hideCompleted: true,
        setHideCompleted,
      }),
    ).toEqual({
      hideCompleted: true,
      setHideCompleted,
    });
  });

  it("hideCompleted が false の場合もそのまま返す", () => {
    const setHideCompleted = jest.fn();

    const result = createTodoListHideCompletedStateResult({
      hideCompleted: false,
      setHideCompleted,
    });

    expect(result.hideCompleted).toBe(false);
    expect(result.setHideCompleted).toBe(setHideCompleted);
  });
});
