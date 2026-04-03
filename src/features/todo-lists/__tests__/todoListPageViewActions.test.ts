import { addTodoItemFromDetailInput } from "../todoListPageViewActions";
import { normalizeTitle } from "../todoListTitleNormalization";

jest.mock("../todoListTitleNormalization", () => ({
  normalizeTitle: jest.fn(),
}));

describe("todoListPageViewActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListTitleNormalization")
    >("../todoListTitleNormalization");
    (normalizeTitle as jest.Mock).mockImplementation(real.normalizeTitle);
  });
  it("入力値から Todo 追加を実行し、成功時に入力をリセットする", () => {
    const onAddItem = jest.fn();
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: " New Task ",
        listId: "list-1",
        onAddItem,
        clearInput,
        focusInput,
      }),
    ).toBe(true);

    expect(onAddItem).toHaveBeenCalledWith("list-1", "New Task");
    expect(clearInput).toHaveBeenCalled();
    expect(focusInput).toHaveBeenCalled();
  });

  it("空白のみの入力では追加せず false を返す", () => {
    const onAddItem = jest.fn();
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: "   ",
        listId: "list-1",
        onAddItem,
        clearInput,
        focusInput,
      }),
    ).toBe(false);

    expect(onAddItem).not.toHaveBeenCalled();
    expect(clearInput).not.toHaveBeenCalled();
    expect(focusInput).not.toHaveBeenCalled();
  });

  it("入力値の前後の空白をトリムして追加する", () => {
    const onAddItem = jest.fn();
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    addTodoItemFromDetailInput({
      inputText: "  trimmed task  ",
      listId: "list-2",
      onAddItem,
      clearInput,
      focusInput,
    });

    expect(onAddItem).toHaveBeenCalledWith("list-2", "trimmed task");
  });

  it("空文字の入力では追加せず false を返す", () => {
    const onAddItem = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: "",
        listId: "list-1",
        onAddItem,
        clearInput: jest.fn(),
        focusInput: jest.fn(),
      }),
    ).toBe(false);

    expect(onAddItem).not.toHaveBeenCalled();
  });

  it("追加成功後に clearInput と focusInput を両方呼ぶ", () => {
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    addTodoItemFromDetailInput({
      inputText: "task",
      listId: "list-1",
      onAddItem: jest.fn(),
      clearInput,
      focusInput,
    });

    expect(clearInput).toHaveBeenCalledTimes(1);
    expect(focusInput).toHaveBeenCalledTimes(1);
  });

  it("addTodoItemFromDetailInput は normalizeTitle に委譲する", () => {
    const onAddItem = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue("NormalizedTask");

    addTodoItemFromDetailInput({
      inputText: "  raw input  ",
      listId: "list-1",
      onAddItem,
      clearInput: jest.fn(),
      focusInput: jest.fn(),
    });

    expect(normalizeTitle).toHaveBeenCalledWith("  raw input  ");
    expect(onAddItem).toHaveBeenCalledWith("list-1", "NormalizedTask");
  });

  it("normalizeTitle が null を返すと onAddItem を呼ばずに false を返す", () => {
    const onAddItem = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue(null);

    const result = addTodoItemFromDetailInput({
      inputText: "   ",
      listId: "list-1",
      onAddItem,
      clearInput: jest.fn(),
      focusInput: jest.fn(),
    });

    expect(result).toBe(false);
    expect(onAddItem).not.toHaveBeenCalled();
  });
});
