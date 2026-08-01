import { fireEvent, render, screen, within } from "@testing-library/react";
import { TodoCategoryManagementItem } from "../TodoCategoryManagementItem";
import type { TodoCategory } from "../types";

const createCategory = (
  overrides: Partial<TodoCategory> = {},
): TodoCategory => ({
  id: "cat-1",
  name: "仕事",
  createdAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const defaultProps = {
  category: createCategory(),
  editingCategoryId: null,
  editingCategoryNameValue: "",
  onChangeNameValueAction: jest.fn(),
  onCommitEditAction: jest.fn(),
  onCancelEditAction: jest.fn(),
  onStartEditAction: jest.fn(),
  colorEditingCategoryId: null,
  onToggleColorPickerAction: jest.fn(),
  onCloseColorPickerAction: jest.fn(),
  onUpdateColorAction: jest.fn(),
  onDeleteAction: jest.fn(),
};

describe("TodoCategoryManagementItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("カテゴリ名を表示する", () => {
    render(<TodoCategoryManagementItem {...defaultProps} />);
    expect(screen.getByText("🏷️ 仕事")).toBeInTheDocument();
  });

  it("並び替え用のドラッグハンドルを表示する", () => {
    render(<TodoCategoryManagementItem {...defaultProps} />);
    expect(screen.getByLabelText("並び替え")).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onStartEditAction が呼ばれる", () => {
    const onStartEditAction = jest.fn();
    render(
      <TodoCategoryManagementItem {...defaultProps} onStartEditAction={onStartEditAction} />,
    );
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    expect(onStartEditAction).toHaveBeenCalledWith("cat-1", "仕事");
  });

  it("削除ボタンをクリックすると onDeleteAction が呼ばれる", () => {
    const onDeleteAction = jest.fn();
    render(<TodoCategoryManagementItem {...defaultProps} onDeleteAction={onDeleteAction} />);
    fireEvent.click(screen.getByLabelText("仕事 を削除"));
    expect(onDeleteAction).toHaveBeenCalledWith(defaultProps.category);
  });

  it("編集中はインライン入力フィールドを表示する", () => {
    render(
      <TodoCategoryManagementItem
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="変更後名"
      />,
    );
    const input = screen.getByDisplayValue("変更後名");
    expect(input).toBeInTheDocument();
    expect(screen.queryByText("🏷️ 仕事")).not.toBeInTheDocument();
  });

  it("編集中に Enter キーで onCommitEditAction が呼ばれる", () => {
    const onCommitEditAction = jest.fn();
    render(
      <TodoCategoryManagementItem
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="テスト"
        onCommitEditAction={onCommitEditAction}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Enter" });
    expect(onCommitEditAction).toHaveBeenCalledTimes(1);
  });

  it("編集中に Escape キーで onCancelEditAction が呼ばれる", () => {
    const onCancelEditAction = jest.fn();
    render(
      <TodoCategoryManagementItem
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="テスト"
        onCancelEditAction={onCancelEditAction}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Escape" });
    expect(onCancelEditAction).toHaveBeenCalledTimes(1);
  });

  it("編集中は編集ボタンを表示しない", () => {
    render(
      <TodoCategoryManagementItem
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="テスト"
      />,
    );
    expect(screen.queryByLabelText("仕事 を編集")).not.toBeInTheDocument();
  });

  describe("色編集ポップオーバー", () => {
    it("色スウォッチボタンをクリックすると onToggleColorPickerAction が呼ばれる", () => {
      const onToggleColorPickerAction = jest.fn();
      render(
        <TodoCategoryManagementItem
          {...defaultProps}
          onToggleColorPickerAction={onToggleColorPickerAction}
        />,
      );
      fireEvent.click(screen.getByLabelText("仕事 の背景色を変更"));
      expect(onToggleColorPickerAction).toHaveBeenCalledWith("cat-1");
    });

    it("colorEditingCategoryId が category.id に一致するときカラーパネルを表示する", () => {
      render(
        <TodoCategoryManagementItem
          {...defaultProps}
          colorEditingCategoryId="cat-1"
        />,
      );
      expect(
        screen.getByRole("radiogroup", { name: "背景色" }),
      ).toBeInTheDocument();
    });

    it("colorEditingCategoryId が一致しないときカラーパネルを非表示にする", () => {
      render(
        <TodoCategoryManagementItem
          {...defaultProps}
          colorEditingCategoryId="cat-999"
        />,
      );
      expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    });

    it("カラースウォッチ選択で onUpdateColorAction と onCloseColorPickerAction が呼ばれる", () => {
      render(
        <TodoCategoryManagementItem
          {...defaultProps}
          colorEditingCategoryId="cat-1"
        />,
      );
      const radiogroup = screen.getByRole("radiogroup", { name: "背景色" });
      const redSwatch = within(radiogroup).getByRole("radio", { name: "赤" });
      fireEvent.click(redSwatch);
      expect(defaultProps.onUpdateColorAction).toHaveBeenCalledWith(
        "cat-1",
        "bg-red-50",
      );
      expect(defaultProps.onCloseColorPickerAction).toHaveBeenCalledTimes(1);
    });

    it("色スウォッチボタンの aria-expanded は色ピッカーの開閉状態を反映する", () => {
      const { rerender } = render(
        <TodoCategoryManagementItem
          {...defaultProps}
          colorEditingCategoryId={null}
        />,
      );
      expect(screen.getByLabelText("仕事 の背景色を変更")).toHaveAttribute(
        "aria-expanded",
        "false",
      );

      rerender(
        <TodoCategoryManagementItem
          {...defaultProps}
          colorEditingCategoryId="cat-1"
        />,
      );
      expect(screen.getByLabelText("仕事 の背景色を変更")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  });
});
