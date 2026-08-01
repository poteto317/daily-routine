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
    expect(
      screen.getByPlaceholderText("リストのタイトル"),
    ).toBeInTheDocument();
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
    render(<TodoListCreateForm {...defaultProps} onChangeTitleAction={onChangeTitleAction} />);
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
    render(<TodoListCreateForm {...defaultProps} onCancelAction={onCancelAction} />);
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
    render(<TodoListCreateForm {...defaultProps} onCancelAction={onCancelAction} />);
    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Escape",
    });
    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });
});
