import { createTodoListDetailFormStateResult } from "../todoListDetailFormStateResult";

describe("createTodoListDetailFormStateResult", () => {
  it("input state と add action の公開 shape を返す", () => {
    const inputState = {
      dragOverIndex: 2,
      inputRef: { current: null },
      inputText: "Task",
      setDragOverIndex: jest.fn(),
      setInputText: jest.fn(),
    };
    const handleAdd = jest.fn(() => true);

    expect(
      createTodoListDetailFormStateResult({
        inputState,
        handleAdd,
      }),
    ).toEqual({
      dragOverIndex: 2,
      handleAdd,
      inputRef: inputState.inputRef,
      inputText: "Task",
      setDragOverIndex: inputState.setDragOverIndex,
      setInputText: inputState.setInputText,
    });
  });
});
