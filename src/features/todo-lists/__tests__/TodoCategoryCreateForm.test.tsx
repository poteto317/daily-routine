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
  onChangeName: jest.fn(),
  onChangeColor: jest.fn(),
  onCreate: jest.fn(),
  onCancel: jest.fn(),
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

  it("入力変更で onChangeName が呼ばれる", () => {
    const onChangeName = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onChangeName={onChangeName} />);
    fireEvent.change(screen.getByPlaceholderText("カテゴリ名"), {
      target: { value: "テスト" },
    });
    expect(onChangeName).toHaveBeenCalledWith("テスト");
  });

  it("色スウォッチ選択で onChangeColor が呼ばれる", () => {
    const onChangeColor = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onChangeColor={onChangeColor} />);
    fireEvent.click(screen.getByRole("radio", { name: "赤" }));
    expect(onChangeColor).toHaveBeenCalledWith("bg-red-50");
  });

  it("作成ボタンクリックで onCreate が呼ばれる", () => {
    const onCreate = jest.fn();
    render(
      <TodoCategoryCreateForm
        {...defaultProps}
        nameInput="仕事"
        onCreate={onCreate}
      />,
    );
    fireEvent.click(screen.getByText("作成"));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("キャンセル"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Enter キーで onCreate が呼ばれる", () => {
    const onCreate = jest.fn();
    render(
      <TodoCategoryCreateForm
        {...defaultProps}
        nameInput="仕事"
        onCreate={onCreate}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Enter",
    });
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(<TodoCategoryCreateForm {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Escape",
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
