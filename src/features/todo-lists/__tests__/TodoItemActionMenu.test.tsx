import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  TodoItemActionMenuTrigger,
  TodoItemActionMenuDropdown,
} from "../TodoItemActionMenu";
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

describe("TodoItemActionMenuTrigger", () => {
  const item = createItem();

  it("⋮ ボタンを表示する", () => {
    render(
      <TodoItemActionMenuTrigger
        item={item}
        itemMenuItemId={null}
        toggleItemMenuAction={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "アクションメニュー" }),
    ).toBeInTheDocument();
  });

  it("クリックで toggleItemMenuAction が item.id で呼ばれる", () => {
    const toggleItemMenuAction = jest.fn();
    render(
      <TodoItemActionMenuTrigger
        item={item}
        itemMenuItemId={null}
        toggleItemMenuAction={toggleItemMenuAction}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "アクションメニュー" }));
    expect(toggleItemMenuAction).toHaveBeenCalledWith("item-1");
  });

  it("メニューが閉じているとき aria-expanded が false", () => {
    render(
      <TodoItemActionMenuTrigger
        item={item}
        itemMenuItemId={null}
        toggleItemMenuAction={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "アクションメニュー" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("メニューが開いているとき aria-expanded が true", () => {
    render(
      <TodoItemActionMenuTrigger
        item={item}
        itemMenuItemId="item-1"
        toggleItemMenuAction={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "アクションメニュー" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("PC/モバイル問わず常時表示される（ブレークポイント分岐クラスを持たない）", () => {
    render(
      <TodoItemActionMenuTrigger
        item={item}
        itemMenuItemId={null}
        toggleItemMenuAction={jest.fn()}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: "アクションメニュー",
    }).parentElement;
    expect(trigger?.className).not.toMatch(/(^|\s)(sm|md|lg):/);
  });
});

describe("TodoItemActionMenuDropdown", () => {
  const item = createItem();
  const defaultProps = {
    item,
    listId: "list-1",
    categories,
    currentIndent: 1,
    maxIndent: 3,
    sortModeActive: false,
    itemMenuItemId: "item-1",
    closeItemMenuAction: jest.fn(),
    startEditItemAction: jest.fn(),
    onInsertAfterAction: jest.fn(),
    onOutdentItemAction: jest.fn(),
    onIndentItemAction: jest.fn(),
    onUpdateItemBgColorAction: jest.fn(),
    onUpdateItemCategoryAction: jest.fn(),
    onDeleteItemAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("itemMenuItemId が item.id のときドロップダウンを表示する", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    expect(
      screen.getByLabelText("アクションメニュー"),
    ).toBeInTheDocument();
  });

  it("itemMenuItemId が null のときドロップダウンを非表示にする", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} itemMenuItemId={null} />);
    expect(
      screen.queryByLabelText("アクションメニュー"),
    ).not.toBeInTheDocument();
  });

  it("編集ボタンクリックで startEditItemAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /編集/ }));
    expect(defaultProps.startEditItemAction).toHaveBeenCalledWith("item-1", "テストTodo");
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  it("インデントを下げるボタンクリックで onOutdentItemAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} currentIndent={1} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを下げる/ }));
    expect(defaultProps.onOutdentItemAction).toHaveBeenCalledWith("list-1", "item-1");
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  it("currentIndent が 0 のときインデントを下げるボタンは disabled", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} currentIndent={0} />);
    expect(
      screen.getByRole("button", { name: /インデントを下げる/ }),
    ).toBeDisabled();
  });

  it("インデントを上げるボタンクリックで onIndentItemAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを上げる/ }));
    expect(defaultProps.onIndentItemAction).toHaveBeenCalledWith("list-1", "item-1");
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  it("currentIndent が maxIndent のときインデントを上げるボタンは disabled", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} currentIndent={3} maxIndent={3} />);
    expect(
      screen.getByRole("button", { name: /インデントを上げる/ }),
    ).toBeDisabled();
  });

  it("削除ボタンクリックで onDeleteItemAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(defaultProps.onDeleteItemAction).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "テストTodo",
    );
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  it("下に追加ボタンクリックで onInsertAfterAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /下に追加/ }));
    expect(defaultProps.onInsertAfterAction).toHaveBeenCalledTimes(1);
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  it("背景色の radiogroup を表示する", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("背景色スウォッチ選択で onUpdateItemBgColorAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    const radiogroup = screen.getByRole("radiogroup", { name: "背景色" });
    // index=1（赤: "bg-red-50"）を選択してデフォルト undefined を避ける
    const swatches = within(radiogroup).getAllByRole("radio");
    fireEvent.click(swatches[1]);
    expect(defaultProps.onUpdateItemBgColorAction).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "bg-red-50",
    );
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  it("カテゴリの radiogroup を表示する", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    expect(
      screen.getByRole("radiogroup", { name: "カテゴリ" }),
    ).toBeInTheDocument();
  });

  it("カテゴリスウォッチ選択で onUpdateItemCategoryAction と closeItemMenuAction が呼ばれる", () => {
    render(<TodoItemActionMenuDropdown {...defaultProps} />);
    const radiogroup = screen.getByRole("radiogroup", { name: "カテゴリ" });
    fireEvent.click(within(radiogroup).getByRole("radio", { name: "仕事" }));
    expect(defaultProps.onUpdateItemCategoryAction).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "cat-work",
    );
    expect(defaultProps.closeItemMenuAction).toHaveBeenCalledTimes(1);
  });

  describe("sortModeActive=true のとき（表示順と生配列順の乖離による意図しない再構造化の防止）", () => {
    it("インデント可能な状態でも「上げる」「下げる」両方が disabled になる", () => {
      render(<TodoItemActionMenuDropdown {...defaultProps} sortModeActive={true} />);
      expect(
        screen.getByRole("button", { name: /インデントを下げる/ }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /インデントを上げる/ }),
      ).toBeDisabled();
    });

    it("「下げる」クリックしても onOutdentItemAction は呼ばれない", () => {
      render(<TodoItemActionMenuDropdown {...defaultProps} sortModeActive={true} />);
      fireEvent.click(screen.getByRole("button", { name: /インデントを下げる/ }));
      expect(defaultProps.onOutdentItemAction).not.toHaveBeenCalled();
    });

    it("「上げる」クリックしても onIndentItemAction は呼ばれない", () => {
      render(<TodoItemActionMenuDropdown {...defaultProps} sortModeActive={true} />);
      fireEvent.click(screen.getByRole("button", { name: /インデントを上げる/ }));
      expect(defaultProps.onIndentItemAction).not.toHaveBeenCalled();
    });
  });
});
