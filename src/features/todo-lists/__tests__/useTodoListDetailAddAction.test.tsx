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

  it("追加 action を組み立てて add helper に委譲し、成功時に入力欄からフォーカスを外す", () => {
    const setInputText = jest.fn();
    const onAddItem = jest.fn();
    const blur = jest.fn();
    const inputRef = {
      current: { blur },
    } as unknown as React.RefObject<HTMLInputElement | null>;

    (addTodoItemFromDetailInput as jest.Mock).mockImplementation(
      ({ clearInput, blurInput }) => {
        clearInput();
        blurInput();
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
      blurInput: expect.any(Function),
    });
    expect(setInputText).toHaveBeenCalledWith("");
    // テキスト入力から離れることでソフトウェアキーボードが閉じる
    expect(blur).toHaveBeenCalledTimes(1);
  });
});
