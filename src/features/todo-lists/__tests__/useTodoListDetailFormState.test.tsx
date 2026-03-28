import { act, renderHook } from "@testing-library/react";
import { useTodoListDetailFormState } from "../useTodoListDetailFormState";

describe("useTodoListDetailFormState", () => {
  it("入力 state とドラッグ index を管理し、追加成功後に入力を空にする", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailFormState({
        listId: "list-1",
        onAddItem,
      }),
    );

    act(() => {
      result.current.setInputText(" New Task ");
      result.current.setDragOverIndex(2);
    });

    expect(result.current.dragOverIndex).toBe(2);

    let didAdd = false;
    act(() => {
      didAdd = result.current.handleAdd();
    });

    expect(didAdd).toBe(true);
    expect(onAddItem).toHaveBeenCalledWith("list-1", "New Task");
    expect(result.current.inputText).toBe("");
  });

  it("空入力では追加しない", () => {
    const onAddItem = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailFormState({
        listId: "list-1",
        onAddItem,
      }),
    );

    act(() => {
      result.current.setInputText("   ");
    });

    let didAdd = true;
    act(() => {
      didAdd = result.current.handleAdd();
    });

    expect(didAdd).toBe(false);
    expect(onAddItem).not.toHaveBeenCalled();
  });
});
