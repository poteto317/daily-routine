import { renderHook } from "@testing-library/react";
import { useTodoListMoveCompletedToBottomActions } from "../useTodoListMoveCompletedToBottomActions";

describe("useTodoListMoveCompletedToBottomActions", () => {
  it("toggleMoveCompletedToBottom を返す", () => {
    const setMoveCompletedToBottom = jest.fn();
    const { result } = renderHook(() =>
      useTodoListMoveCompletedToBottomActions({ setMoveCompletedToBottom }),
    );
    expect(typeof result.current.toggleMoveCompletedToBottom).toBe("function");
  });

  it("toggleMoveCompletedToBottom を呼ぶと setMoveCompletedToBottom に反転関数が渡される", () => {
    const setMoveCompletedToBottom = jest.fn();
    const { result } = renderHook(() =>
      useTodoListMoveCompletedToBottomActions({ setMoveCompletedToBottom }),
    );

    result.current.toggleMoveCompletedToBottom();
    expect(setMoveCompletedToBottom).toHaveBeenCalledTimes(1);

    const updater = setMoveCompletedToBottom.mock.calls[0][0] as (
      v: boolean,
    ) => boolean;
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  it("setMoveCompletedToBottom が変わらない限り toggleMoveCompletedToBottom の参照が安定する", () => {
    const setMoveCompletedToBottom = jest.fn();
    const { result, rerender } = renderHook(() =>
      useTodoListMoveCompletedToBottomActions({ setMoveCompletedToBottom }),
    );
    const first = result.current.toggleMoveCompletedToBottom;
    rerender();
    expect(result.current.toggleMoveCompletedToBottom).toBe(first);
  });
});
