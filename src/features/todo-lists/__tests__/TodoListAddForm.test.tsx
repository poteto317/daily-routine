import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListAddForm } from "../TodoListAddForm";

const defaultProps = {
  inputRef: { current: null },
  inputText: "",
  onChangeText: jest.fn(),
  onAdd: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListAddForm", () => {
  it("テキスト入力フィールドを表示する", () => {
    render(<TodoListAddForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Todoを追加..."),
    ).toBeInTheDocument();
  });

  it("入力変更で onChangeText が呼ばれる", () => {
    render(<TodoListAddForm {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
      target: { value: "新しいTodo" },
    });
    expect(defaultProps.onChangeText).toHaveBeenCalledWith("新しいTodo");
  });

  it("追加ボタンクリックで onAdd が呼ばれる", () => {
    render(<TodoListAddForm {...defaultProps} inputText="テスト" />);
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it("inputText が空のとき追加ボタンが disabled になる", () => {
    render(<TodoListAddForm {...defaultProps} inputText="" />);
    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("inputText が空白のみのとき追加ボタンが disabled になる", () => {
    render(<TodoListAddForm {...defaultProps} inputText="   " />);
    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("inputText が入力されているとき追加ボタンが有効になる", () => {
    render(<TodoListAddForm {...defaultProps} inputText="テスト" />);
    expect(screen.getByRole("button", { name: "追加" })).toBeEnabled();
  });

  it("Enter キーで onAdd が呼ばれる", () => {
    render(<TodoListAddForm {...defaultProps} inputText="テスト" />);
    fireEvent.keyDown(screen.getByPlaceholderText("Todoを追加..."), {
      key: "Enter",
    });
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it("IME 変換中の Enter では onAdd が呼ばれない", () => {
    render(<TodoListAddForm {...defaultProps} inputText="テスト" />);
    fireEvent.keyDown(screen.getByPlaceholderText("Todoを追加..."), {
      key: "Enter",
      nativeEvent: { isComposing: true },
      isComposing: true,
    });
    expect(defaultProps.onAdd).not.toHaveBeenCalled();
  });
});
