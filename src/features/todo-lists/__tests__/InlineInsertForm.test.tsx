import { fireEvent, render, screen } from "@testing-library/react";
import { InlineInsertForm } from "../InlineInsertForm";

describe("InlineInsertForm", () => {
  const defaultProps = {
    inputText: "",
    onChangeTextAction: jest.fn(),
    onAddAction: jest.fn(),
    onCancelAction: jest.fn(),
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

  it("テキスト入力で onChangeTextAction が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "新しいTodo" },
    });
    expect(defaultProps.onChangeTextAction).toHaveBeenCalledWith("新しいTodo");
  });

  it("追加ボタンクリックで onAddAction が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(defaultProps.onAddAction).toHaveBeenCalledTimes(1);
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

  it("Enter キーで onAddAction が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(defaultProps.onAddAction).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancelAction が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(defaultProps.onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancelAction が呼ばれる", () => {
    render(<InlineInsertForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(defaultProps.onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("フォームに role=form と aria-label が設定されている", () => {
    render(<InlineInsertForm {...defaultProps} />);
    expect(screen.getByRole("form", { name: "アイテムを挿入" })).toBeInTheDocument();
  });

  it("追加ボタンクリックで入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    const input = screen.getByRole("textbox");
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    // blur されて body へ戻る（要素が消えただけの状態と区別する）
    expect(document.activeElement).toBe(document.body);
  });

  it("Enterキーでの追加でも入力欄からフォーカスが外れる", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.activeElement).toBe(document.body);
  });

  it("IME変換中のEnterではフォーカスを外さない（変換確定と誤って閉じるのを防ぐ）", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, {
      key: "Enter",
      nativeEvent: { isComposing: true },
      isComposing: true,
    });

    expect(document.activeElement).toBe(input);
  });

  it("空欄でEnterを押しても何も追加されず、フォーカスも外れない", () => {
    // ボタンはdisabledで守られているが、Enterキー経路には元々ガードがない。
    // ここでガードしないと、何も追加されていないのにキーボードだけ閉じてしまう。
    render(<InlineInsertForm {...defaultProps} inputText="" />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onAddAction).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("空白のみでEnterを押しても何も追加されず、フォーカスも外れない", () => {
    render(<InlineInsertForm {...defaultProps} inputText="   " />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onAddAction).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });
});
