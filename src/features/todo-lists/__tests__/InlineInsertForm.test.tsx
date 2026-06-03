import { fireEvent, render, screen } from "@testing-library/react";
import { InlineInsertForm } from "../InlineInsertForm";

describe("InlineInsertForm", () => {
  const defaultProps = {
    inputText: "",
    onChangeText: jest.fn(),
    onAdd: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("入力フィールドと追加・キャンセルボタンを表示する", () => {
    render(<InlineInsertForm {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("テキスト入力で onChangeText が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "新しいTodo" },
    });
    expect(defaultProps.onChangeText).toHaveBeenCalledWith("新しいTodo");
  });

  it("追加ボタンクリックで onAdd が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it("inputText が空のとき追加ボタンは disabled", () => {
    render(<InlineInsertForm {...defaultProps} inputText="" />);
    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("inputText が空白のみのとき追加ボタンは disabled", () => {
    render(<InlineInsertForm {...defaultProps} inputText="   " />);
    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("inputText があるとき追加ボタンは enabled", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    expect(screen.getByRole("button", { name: "追加" })).toBeEnabled();
  });

  it("Enter キーで onAdd が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancel が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancel が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("フォームに role=form と aria-label が設定されている", () => {
    render(<InlineInsertForm {...defaultProps} />);
    expect(screen.getByRole("form", { name: "アイテムを挿入" })).toBeInTheDocument();
  });
});
