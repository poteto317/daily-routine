import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoListCreateForm } from "../TodoListCreateForm";

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

const defaultProps = {
  inputRef: createRef<HTMLInputElement>(),
  titleInput: "",
  onChangeTitleAction: jest.fn(),
  onCreateAction: jest.fn(),
  onCancelAction: jest.fn(),
};

describe("TodoListCreateForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("タイトルラベルと入力フィールドを表示する", () => {
    render(<TodoListCreateForm {...defaultProps} />);
    expect(screen.getByText("新しいリストを作成")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("リストのタイトル")).toBeInTheDocument();
  });

  it("作成・キャンセルボタンを表示する", () => {
    render(<TodoListCreateForm {...defaultProps} />);
    expect(screen.getByText("作成")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("入力内容が空のとき作成ボタンが disabled になる", () => {
    render(<TodoListCreateForm {...defaultProps} titleInput="" />);
    expect(screen.getByText("作成")).toBeDisabled();
  });

  it("入力内容があるとき作成ボタンが有効になる", () => {
    render(<TodoListCreateForm {...defaultProps} titleInput="新しいリスト" />);
    expect(screen.getByText("作成")).not.toBeDisabled();
  });

  it("入力変更で onChangeTitleAction が呼ばれる", () => {
    const onChangeTitleAction = jest.fn();
    render(
      <TodoListCreateForm
        {...defaultProps}
        onChangeTitleAction={onChangeTitleAction}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("リストのタイトル"), {
      target: { value: "テスト" },
    });
    expect(onChangeTitleAction).toHaveBeenCalledWith("テスト");
  });

  it("作成ボタンクリックで onCreateAction が呼ばれる", () => {
    const onCreateAction = jest.fn();
    render(
      <TodoListCreateForm
        {...defaultProps}
        titleInput="新しいリスト"
        onCreateAction={onCreateAction}
      />,
    );
    fireEvent.click(screen.getByText("作成"));
    expect(onCreateAction).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancelAction が呼ばれる", () => {
    const onCancelAction = jest.fn();
    render(
      <TodoListCreateForm {...defaultProps} onCancelAction={onCancelAction} />,
    );
    fireEvent.click(screen.getByText("キャンセル"));
    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("Enter キーで onCreateAction が呼ばれる", () => {
    const onCreateAction = jest.fn();
    render(
      <TodoListCreateForm
        {...defaultProps}
        titleInput="リスト"
        onCreateAction={onCreateAction}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Enter",
    });
    expect(onCreateAction).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancelAction が呼ばれる", () => {
    const onCancelAction = jest.fn();
    render(
      <TodoListCreateForm {...defaultProps} onCancelAction={onCancelAction} />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Escape",
    });
    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("作成ボタンのクリックで入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", () => {
    render(<TodoListCreateForm {...defaultProps} titleInput="テスト" />);
    const input = screen.getByPlaceholderText("リストのタイトル");
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "作成" }));

    expect(document.activeElement).toBe(document.body);
  });

  it("Enterキーでの作成でも入力欄からフォーカスが外れる", () => {
    render(<TodoListCreateForm {...defaultProps} titleInput="テスト" />);
    const input = screen.getByPlaceholderText("リストのタイトル");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.activeElement).toBe(document.body);
  });

  it("空欄でEnterを押しても作成されず、フォーカスも外れない", () => {
    // 作成ボタンは disabled で守られるが、Enterキー経路には元々ガードがない。
    // 何も作成されていないのにキーボードだけ閉じるのを防ぐ。
    render(<TodoListCreateForm {...defaultProps} />);
    const input = screen.getByPlaceholderText("リストのタイトル");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onCreateAction).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("送信可否の判定が作成ボタンの活性状態とEnterキーの可否で一致する", () => {
    // 判定式が2箇所に分かれていると、片方だけ壊れて
    // 「ボタンは押せないのにEnterでは通る」という不整合が起きうる
    render(<TodoListCreateForm {...defaultProps} titleInput="   " />);

    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();

    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Enter",
    });

    expect(defaultProps.onCreateAction).not.toHaveBeenCalled();
  });

  it("全角スペースのみでも作成できない（ハンドラ側の正規化と判定が一致する）", () => {
    render(<TodoListCreateForm {...defaultProps} titleInput="　　" />);

    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();

    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Enter",
    });

    expect(defaultProps.onCreateAction).not.toHaveBeenCalled();
  });
});
