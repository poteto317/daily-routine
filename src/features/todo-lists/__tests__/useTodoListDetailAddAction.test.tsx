import { act, renderHook } from "@testing-library/react";

jest.mock("../todoListPageViewActions", () => ({
  addTodoItemFromDetailInput: jest.fn(),
}));

import { addTodoItemFromDetailInput } from "../todoListPageViewActions";
import { useTodoListDetailAddAction } from "../useTodoListDetailAddAction";

describe("useTodoListDetailAddAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("追加 action を組み立てて add helper に委譲する", () => {
    const setInputText = jest.fn();
    const onAddItem = jest.fn();
    const focus = jest.fn();
    const inputRef = {
      current: { focus },
    } as unknown as React.RefObject<HTMLInputElement | null>;

    (addTodoItemFromDetailInput as jest.Mock).mockImplementation(
      ({ clearInput, focusInput }) => {
        clearInput();
        focusInput();
        return true;
      },
    );

    const { result } = renderHook(() =>
      useTodoListDetailAddAction({
        inputText: " New Task ",
        listId: "list-1",
        onAddItem,
        setInputText,
        inputRef,
      }),
    );

    let didAdd = false;
    act(() => {
      didAdd = result.current.handleAdd();
    });

    expect(didAdd).toBe(true);
    expect(addTodoItemFromDetailInput).toHaveBeenCalledWith({
      inputText: " New Task ",
      listId: "list-1",
      onAddItem,
      clearInput: expect.any(Function),
      focusInput: expect.any(Function),
    });
    expect(setInputText).toHaveBeenCalledWith("");
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
