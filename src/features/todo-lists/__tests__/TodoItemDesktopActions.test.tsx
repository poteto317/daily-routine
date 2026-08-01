import { fireEvent, render, screen, within } from "@testing-library/react";
import { TodoItemDesktopActions } from "../TodoItemDesktopActions";
import type { TodoCategory, TodoListItem } from "../types";

const createItem = (
  overrides: Partial<
    Pick<TodoListItem, "id" | "title" | "bgColor" | "categoryId">
  > = {},
): Pick<TodoListItem, "id" | "title" | "bgColor" | "categoryId"> => ({
  id: "item-1",
  title: "テストTodo",
  bgColor: undefined,
  categoryId: undefined,
  ...overrides,
});

const categories: TodoCategory[] = [
  { id: "cat-work", name: "仕事", createdAt: "" },
];

describe("TodoItemDesktopActions", () => {
  const defaultProps = {
    item: createItem(),
    listId: "list-1",
    categories,
    colorPickerItemId: null,
    categoryPickerItemId: null,
    isInlineInsertOpen: false,
    toggleItemColorPickerAction: jest.fn(),
    closeItemColorPickerAction: jest.fn(),
    toggleItemCategoryPickerAction: jest.fn(),
    closeItemCategoryPickerAction: jest.fn(),
    onUpdateItemBgColorAction: jest.fn(),
    onUpdateItemCategoryAction: jest.fn(),
    startEditItemAction: jest.fn(),
    onDeleteItemAction: jest.fn(),
    onInsertAfterAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("背景色変更・カテゴリ・編集・削除・下に追加ボタンを表示する", () => {
    render(<TodoItemDesktopActions {...defaultProps} />);
    expect(screen.getByRole("button", { name: "背景色を変更" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "カテゴリ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下に追加" })).toBeInTheDocument();
  });

  it("カラーピッカーボタンクリックで toggleItemColorPickerAction が item.id で呼ばれる", () => {
    render(<TodoItemDesktopActions {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "背景色を変更" }));
    expect(defaultProps.toggleItemColorPickerAction).toHaveBeenCalledWith("item-1");
  });

  it("colorPickerItemId が item.id に一致するときカラーパネルを表示する", () => {
    render(
      <TodoItemDesktopActions
        {...defaultProps}
        colorPickerItemId="item-1"
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("colorPickerItemId が null のときカラーパネルを非表示にする", () => {
    render(<TodoItemDesktopActions {...defaultProps} colorPickerItemId={null} />);
    expect(screen.queryByRole("radiogroup", { name: "背景色" })).not.toBeInTheDocument();
  });

  it("カラースウォッチ選択で onUpdateItemBgColorAction と closeItemColorPickerAction が呼ばれる", () => {
    render(
      <TodoItemDesktopActions
        {...defaultProps}
        colorPickerItemId="item-1"
      />,
    );
    const radiogroup = screen.getByRole("radiogroup", { name: "背景色" });
    // index=1（赤: "bg-red-50"）を選択してデフォルト undefined を避ける
    const redSwatch = within(radiogroup).getAllByRole("radio")[1];
    fireEvent.click(redSwatch);
    expect(defaultProps.onUpdateItemBgColorAction).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "bg-red-50",
    );
    expect(defaultProps.closeItemColorPickerAction).toHaveBeenCalledTimes(1);
  });

  it("カテゴリピッカーボタンクリックで toggleItemCategoryPickerAction が item.id で呼ばれる", () => {
    render(<TodoItemDesktopActions {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "カテゴリ" }));
    expect(defaultProps.toggleItemCategoryPickerAction).toHaveBeenCalledWith(
      "item-1",
    );
  });

  it("categoryPickerItemId が item.id に一致するときカテゴリパネルを表示する", () => {
    render(
      <TodoItemDesktopActions
        {...defaultProps}
        categoryPickerItemId="item-1"
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "カテゴリ" }),
    ).toBeInTheDocument();
  });

  it("categoryPickerItemId が null のときカテゴリパネルを非表示にする", () => {
    render(
      <TodoItemDesktopActions {...defaultProps} categoryPickerItemId={null} />,
    );
    expect(
      screen.queryByRole("radiogroup", { name: "カテゴリ" }),
    ).not.toBeInTheDocument();
  });

  it("カテゴリスウォッチ選択で onUpdateItemCategoryAction と closeItemCategoryPickerAction が呼ばれる", () => {
    render(
      <TodoItemDesktopActions
        {...defaultProps}
        categoryPickerItemId="item-1"
      />,
    );
    const radiogroup = screen.getByRole("radiogroup", { name: "カテゴリ" });
    fireEvent.click(within(radiogroup).getByRole("radio", { name: "仕事" }));
    expect(defaultProps.onUpdateItemCategoryAction).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "cat-work",
    );
    expect(defaultProps.closeItemCategoryPickerAction).toHaveBeenCalledTimes(1);
  });

  it("カテゴリボタンの aria-expanded はカテゴリピッカーの開閉状態を反映する", () => {
    const { rerender } = render(
      <TodoItemDesktopActions {...defaultProps} categoryPickerItemId={null} />,
    );
    expect(screen.getByRole("button", { name: "カテゴリ" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    rerender(
      <TodoItemDesktopActions
        {...defaultProps}
        categoryPickerItemId="item-1"
      />,
    );
    expect(screen.getByRole("button", { name: "カテゴリ" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("編集ボタンクリックで startEditItemAction が item.id と title で呼ばれる", () => {
    render(<TodoItemDesktopActions {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(defaultProps.startEditItemAction).toHaveBeenCalledWith("item-1", "テストTodo");
  });

  it("削除ボタンクリックで onDeleteItemAction が listId・item.id・title で呼ばれる", () => {
    render(<TodoItemDesktopActions {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onDeleteItemAction).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "テストTodo",
    );
  });

  it("下に追加ボタンクリックで onInsertAfterAction が呼ばれる", () => {
    render(<TodoItemDesktopActions {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "下に追加" }));
    expect(defaultProps.onInsertAfterAction).toHaveBeenCalledTimes(1);
  });

  it("isInlineInsertOpen が true のとき下に追加ボタンの aria-expanded が true", () => {
    render(
      <TodoItemDesktopActions {...defaultProps} isInlineInsertOpen={true} />,
    );
    expect(
      screen.getByRole("button", { name: "下に追加" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("背景色ボタンの aria-expanded はカラーピッカーの開閉状態を反映する", () => {
    const { rerender } = render(
      <TodoItemDesktopActions {...defaultProps} colorPickerItemId={null} />,
    );
    expect(screen.getByRole("button", { name: "背景色を変更" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    rerender(
      <TodoItemDesktopActions {...defaultProps} colorPickerItemId="item-1" />,
    );
    expect(screen.getByRole("button", { name: "背景色を変更" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
