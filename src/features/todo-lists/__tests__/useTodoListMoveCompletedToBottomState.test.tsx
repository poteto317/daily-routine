import { act, renderHook } from "@testing-library/react";
import { useTodoListMoveCompletedToBottomState } from "../useTodoListMoveCompletedToBottomState";

describe("useTodoListMoveCompletedToBottomState", () => {
  it("初期値は false", () => {
    const { result } = renderHook(() => useTodoListMoveCompletedToBottomState());
    expect(result.current.moveCompletedToBottom).toBe(false);
  });

  it("setMoveCompletedToBottom を呼ぶと値が更新される", () => {
    const { result } = renderHook(() => useTodoListMoveCompletedToBottomState());
    act(() => {
      result.current.setMoveCompletedToBottom(true);
    });
    expect(result.current.moveCompletedToBottom).toBe(true);
  });

  it("setMoveCompletedToBottom で false に戻せる", () => {
    const { result } = renderHook(() => useTodoListMoveCompletedToBottomState());
    act(() => {
      result.current.setMoveCompletedToBottom(true);
    });
    act(() => {
      result.current.setMoveCompletedToBottom(false);
    });
    expect(result.current.moveCompletedToBottom).toBe(false);
  });
});
