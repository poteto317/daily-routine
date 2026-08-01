import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoCategoryCreateForm } from "../TodoCategoryCreateForm";

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

const defaultProps = {
  inputRef: createRef<HTMLInputElement>(),
  nameInput: "",
  colorInput: undefined,
  onChangeNameAction: jest.fn(),
  onChangeColorAction: jest.fn(),
  onCreateAction: jest.fn(),
  onCancelAction: jest.fn(),
};

describe("TodoCategoryCreateForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("タイトルラベルと入力フィールドを表示する", () => {
    render(<TodoCategoryCreateForm {...defaultProps} />);
    expect(screen.getByText("新しいカテゴリを作成")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("カテゴリ名")).toBeInTheDocument();
  });

  it("色選択の radiogroup を表示する", () => {
    render(<TodoCategoryCreateForm {...defaultProps} />);
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("作成・キャンセルボタンを表示する", () => {
    render(<TodoCategoryCreateForm {...defaultProps} />);
    expect(screen.getByText("作成")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("入力内容が空のとき作成ボタンが disabled になる", () => {
    render(<TodoCategoryCreateForm {...defaultProps} nameInput="" />);
    expect(screen.getByText("作成")).toBeDisabled();
  });

  it("入力内容があるとき作成ボタンが有効になる", () => {
    render(<TodoCategoryCreateForm {...defaultProps} nameInput="仕事" />);
    expect(screen.getByText("作成")).not.toBeDisabled();
  });

  it("入力変更で onChangeNameAction が呼ばれる", () => {
    const onChangeNameAction = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onChangeNameAction={onChangeNameAction} />);
    fireEvent.change(screen.getByPlaceholderText("カテゴリ名"), {
      target: { value: "テスト" },
    });
    expect(onChangeNameAction).toHaveBeenCalledWith("テスト");
  });

  it("色スウォッチ選択で onChangeColorAction が呼ばれる", () => {
    const onChangeColorAction = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onChangeColorAction={onChangeColorAction} />);
    fireEvent.click(screen.getByRole("radio", { name: "赤" }));
    expect(onChangeColorAction).toHaveBeenCalledWith("bg-red-50");
  });

  it("作成ボタンクリックで onCreateAction が呼ばれる", () => {
    const onCreateAction = jest.fn();
    render(
      <TodoCategoryCreateForm
        {...defaultProps}
        nameInput="仕事"
        onCreateAction={onCreateAction}
      />,
    );
    fireEvent.click(screen.getByText("作成"));
    expect(onCreateAction).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancelAction が呼ばれる", () => {
    const onCancelAction = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onCancelAction={onCancelAction} />);
    fireEvent.click(screen.getByText("キャンセル"));
    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("Enter キーで onCreateAction が呼ばれる", () => {
    const onCreateAction = jest.fn();
    render(
      <TodoCategoryCreateForm
        {...defaultProps}
        nameInput="仕事"
        onCreateAction={onCreateAction}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Enter",
    });
    expect(onCreateAction).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancelAction が呼ばれる", () => {
    const onCancelAction = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onCancelAction={onCancelAction} />);
    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Escape",
    });
    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });
});
