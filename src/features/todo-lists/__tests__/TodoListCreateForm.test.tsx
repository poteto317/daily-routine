import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoListCreateForm } from "../TodoListCreateForm";

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

const defaultProps = {
  inputRef: createRef<HTMLInputElement>(),
  titleInput: "",
  onChangeTitle: jest.fn(),
  onCreate: jest.fn(),
  onCancel: jest.fn(),
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

  it("入力変更で onChangeTitle が呼ばれる", () => {
    const onChangeTitle = jest.fn();
    render(<TodoListCreateForm {...defaultProps} onChangeTitle={onChangeTitle} />);
    fireEvent.change(screen.getByPlaceholderText("リストのタイトル"), {
      target: { value: "テスト" },
    });
    expect(onChangeTitle).toHaveBeenCalledWith("テスト");
  });

  it("作成ボタンクリックで onCreate が呼ばれる", () => {
    const onCreate = jest.fn();
    render(
      <TodoListCreateForm
        {...defaultProps}
        titleInput="新しいリスト"
        onCreate={onCreate}
      />,
    );
    fireEvent.click(screen.getByText("作成"));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(<TodoListCreateForm {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("キャンセル"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Enter キーで onCreate が呼ばれる", () => {
    const onCreate = jest.fn();
    render(
      <TodoListCreateForm
        {...defaultProps}
        titleInput="リスト"
        onCreate={onCreate}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Enter",
    });
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(<TodoListCreateForm {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByPlaceholderText("リストのタイトル"), {
      key: "Escape",
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
