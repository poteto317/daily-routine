import { act, renderHook } from "@testing-library/react";
import { useTodoListDetailInputState } from "../useTodoListDetailInputState";

describe("useTodoListDetailInputState", () => {
  it("入力文字列と drag index を管理する", () => {
    const { result } = renderHook(() => useTodoListDetailInputState());

    expect(result.current.inputText).toBe("");
    expect(result.current.dragOverIndex).toBeNull();
    expect(result.current.inputRef.current).toBeNull();

    act(() => {
      result.current.setInputText("Task");
      result.current.setDragOverIndex(3);
    });

    expect(result.current.inputText).toBe("Task");
    expect(result.current.dragOverIndex).toBe(3);
  });
});
