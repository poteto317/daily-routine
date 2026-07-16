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
  onChangeNameValue: jest.fn(),
  onCommitEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onStartEdit: jest.fn(),
  colorEditingCategoryId: null,
  onToggleColorPicker: jest.fn(),
  onCloseColorPicker: jest.fn(),
  onUpdateColor: jest.fn(),
  onDelete: jest.fn(),
};

describe("TodoCategoryManagementItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("カテゴリ名を表示する", () => {
    render(<TodoCategoryManagementItem {...defaultProps} />);
    expect(screen.getByText("🏷️ 仕事")).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onStartEdit が呼ばれる", () => {
    const onStartEdit = jest.fn();
    render(
      <TodoCategoryManagementItem {...defaultProps} onStartEdit={onStartEdit} />,
    );
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    expect(onStartEdit).toHaveBeenCalledWith("cat-1", "仕事");
  });

  it("削除ボタンをクリックすると onDelete が呼ばれる", () => {
    const onDelete = jest.fn();
    render(<TodoCategoryManagementItem {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("仕事 を削除"));
    expect(onDelete).toHaveBeenCalledWith(defaultProps.category);
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

  it("編集中に Enter キーで onCommitEdit が呼ばれる", () => {
    const onCommitEdit = jest.fn();
    render(
      <TodoCategoryManagementItem
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="テスト"
        onCommitEdit={onCommitEdit}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Enter" });
    expect(onCommitEdit).toHaveBeenCalledTimes(1);
  });

  it("編集中に Escape キーで onCancelEdit が呼ばれる", () => {
    const onCancelEdit = jest.fn();
    render(
      <TodoCategoryManagementItem
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="テスト"
        onCancelEdit={onCancelEdit}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Escape" });
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
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
    it("色スウォッチボタンをクリックすると onToggleColorPicker が呼ばれる", () => {
      const onToggleColorPicker = jest.fn();
      render(
        <TodoCategoryManagementItem
          {...defaultProps}
          onToggleColorPicker={onToggleColorPicker}
        />,
      );
      fireEvent.click(screen.getByLabelText("仕事 の背景色を変更"));
      expect(onToggleColorPicker).toHaveBeenCalledWith("cat-1");
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

    it("カラースウォッチ選択で onUpdateColor と onCloseColorPicker が呼ばれる", () => {
      render(
        <TodoCategoryManagementItem
          {...defaultProps}
          colorEditingCategoryId="cat-1"
        />,
      );
      const radiogroup = screen.getByRole("radiogroup", { name: "背景色" });
      const redSwatch = within(radiogroup).getByRole("radio", { name: "赤" });
      fireEvent.click(redSwatch);
      expect(defaultProps.onUpdateColor).toHaveBeenCalledWith(
        "cat-1",
        "bg-red-50",
      );
      expect(defaultProps.onCloseColorPicker).toHaveBeenCalledTimes(1);
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
