import { createTodoListDetailItemOrderResult } from "../todoListDetailItemOrderResult";

describe("createTodoListDetailItemOrderResult", () => {
  it("moveCompletedToBottom と toggleMoveCompletedToBottom を含む公開 shape を返す", () => {
    const toggleMoveCompletedToBottom = jest.fn();

    expect(
      createTodoListDetailItemOrderResult({
        moveCompletedToBottomState: {
          moveCompletedToBottom: true,
          setMoveCompletedToBottom: jest.fn(),
        },
        moveCompletedToBottomActions: { toggleMoveCompletedToBottom },
      }),
    ).toEqual({
      moveCompletedToBottom: true,
      toggleMoveCompletedToBottom,
    });
  });

  it("toggleMoveCompletedToBottom が渡した参照のまま result にマッピングされる", () => {
    const toggleMoveCompletedToBottom = jest.fn();

    const result = createTodoListDetailItemOrderResult({
      moveCompletedToBottomState: {
        moveCompletedToBottom: false,
        setMoveCompletedToBottom: jest.fn(),
      },
      moveCompletedToBottomActions: { toggleMoveCompletedToBottom },
    });

    expect(result.toggleMoveCompletedToBottom).toBe(toggleMoveCompletedToBottom);
  });
});
