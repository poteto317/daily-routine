import { createTodoListDetailHideCompletedResult } from "../todoListDetailHideCompletedResult";

describe("createTodoListDetailHideCompletedResult", () => {
  it("hideCompleted と toggleHideCompleted を含む公開 shape を返す", () => {
    const toggleHideCompleted = jest.fn();

    expect(
      createTodoListDetailHideCompletedResult({
        hideCompleted: true,
        toggleHideCompleted,
      }),
    ).toEqual({
      hideCompleted: true,
      toggleHideCompleted,
    });
  });

  it("toggleHideCompleted が渡した参照のまま result にマッピングされる", () => {
    const toggleHideCompleted = jest.fn();

    const result = createTodoListDetailHideCompletedResult({
      hideCompleted: false,
      toggleHideCompleted,
    });

    expect(result.toggleHideCompleted).toBe(toggleHideCompleted);
  });
});
