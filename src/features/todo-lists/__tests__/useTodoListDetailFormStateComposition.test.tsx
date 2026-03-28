import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailFormStateResult", () => ({
  createTodoListDetailFormStateResult: jest.fn(),
}));

jest.mock("../useTodoListDetailInputState", () => ({
  useTodoListDetailInputState: jest.fn(),
}));

jest.mock("../useTodoListDetailAddAction", () => ({
  useTodoListDetailAddAction: jest.fn(),
}));

import { createTodoListDetailFormStateResult } from "../todoListDetailFormStateResult";
import { useTodoListDetailAddAction } from "../useTodoListDetailAddAction";
import { useTodoListDetailFormState } from "../useTodoListDetailFormState";
import { useTodoListDetailInputState } from "../useTodoListDetailInputState";

describe("useTodoListDetailFormState composition", () => {
  it("input state と add action を compose する", () => {
    const inputState = {
      dragOverIndex: null,
      inputRef: { current: null },
      inputText: "",
      setDragOverIndex: jest.fn(),
      setInputText: jest.fn(),
    };
    const handleAdd = jest.fn(() => true);
    const builtResult = {
      dragOverIndex: null,
      handleAdd,
      inputRef: inputState.inputRef,
      inputText: "",
      setDragOverIndex: inputState.setDragOverIndex,
      setInputText: inputState.setInputText,
    };
    const onAddItem = jest.fn();

    (useTodoListDetailInputState as jest.Mock).mockReturnValue(inputState);
    (useTodoListDetailAddAction as jest.Mock).mockReturnValue({ handleAdd });
    (createTodoListDetailFormStateResult as jest.Mock).mockReturnValue(
      builtResult,
    );

    const { result } = renderHook(() =>
      useTodoListDetailFormState({
        listId: "list-1",
        onAddItem,
      }),
    );

    expect(useTodoListDetailInputState).toHaveBeenCalledTimes(1);
    expect(useTodoListDetailAddAction).toHaveBeenCalledWith({
      inputText: "",
      listId: "list-1",
      onAddItem,
      setInputText: inputState.setInputText,
      inputRef: inputState.inputRef,
    });
    expect(createTodoListDetailFormStateResult).toHaveBeenCalledWith({
      inputState,
      handleAdd,
    });
    expect(result.current).toBe(builtResult);
  });
});
