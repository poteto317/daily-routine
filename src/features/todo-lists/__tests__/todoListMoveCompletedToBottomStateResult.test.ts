import { createTodoListMoveCompletedToBottomStateResult } from "../todoListMoveCompletedToBottomStateResult";

describe("createTodoListMoveCompletedToBottomStateResult", () => {
  it("moveCompletedToBottom state の公開 shape を返す", () => {
    const setMoveCompletedToBottom = jest.fn();

    expect(
      createTodoListMoveCompletedToBottomStateResult({
        moveCompletedToBottom: true,
        setMoveCompletedToBottom,
      }),
    ).toEqual({
      moveCompletedToBottom: true,
      setMoveCompletedToBottom,
    });
  });

  it("moveCompletedToBottom が false の場合もそのまま返す", () => {
    const setMoveCompletedToBottom = jest.fn();

    const result = createTodoListMoveCompletedToBottomStateResult({
      moveCompletedToBottom: false,
      setMoveCompletedToBottom,
    });

    expect(result.moveCompletedToBottom).toBe(false);
    expect(result.setMoveCompletedToBottom).toBe(setMoveCompletedToBottom);
  });
});
