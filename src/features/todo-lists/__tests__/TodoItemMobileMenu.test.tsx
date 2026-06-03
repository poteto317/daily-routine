import { fireEvent, render, screen } from "@testing-library/react";
import {
  TodoItemMobileTrigger,
  TodoItemMobileDropdown,
} from "../TodoItemMobileMenu";
import type { TodoListItem } from "../types";

const createItem = (
  overrides: Partial<Pick<TodoListItem, "id" | "title" | "bgColor">> = {},
): Pick<TodoListItem, "id" | "title" | "bgColor"> => ({
  id: "item-1",
  title: "テストTodo",
  bgColor: undefined,
  ...overrides,
});

describe("TodoItemMobileTrigger", () => {
  const item = createItem();

  it("⋮ ボタンを表示する", () => {
    render(
      <TodoItemMobileTrigger
        item={item}
        mobileMenuItemId={null}
        toggleMobileMenu={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "アクションメニュー" }),
    ).toBeInTheDocument();
  });

  it("クリックで toggleMobileMenu が item.id で呼ばれる", () => {
    const toggleMobileMenu = jest.fn();
    render(
      <TodoItemMobileTrigger
        item={item}
        mobileMenuItemId={null}
        toggleMobileMenu={toggleMobileMenu}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "アクションメニュー" }));
    expect(toggleMobileMenu).toHaveBeenCalledWith("item-1");
  });

  it("メニューが閉じているとき aria-expanded が false", () => {
    render(
      <TodoItemMobileTrigger
        item={item}
        mobileMenuItemId={null}
        toggleMobileMenu={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "アクションメニュー" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("メニューが開いているとき aria-expanded が true", () => {
    render(
      <TodoItemMobileTrigger
        item={item}
        mobileMenuItemId="item-1"
        toggleMobileMenu={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "アクションメニュー" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});

describe("TodoItemMobileDropdown", () => {
  const item = createItem();
  const defaultProps = {
    item,
    listId: "list-1",
    currentIndent: 1,
    maxIndent: 3,
    mobileMenuItemId: "item-1",
    closeMobileMenu: jest.fn(),
    startEditItem: jest.fn(),
    onInsertAfter: jest.fn(),
    onOutdentItem: jest.fn(),
    onIndentItem: jest.fn(),
    onUpdateItemBgColor: jest.fn(),
    onDeleteItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mobileMenuItemId が item.id のときドロップダウンを表示する", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    expect(
      screen.getByLabelText("アクションメニュー"),
    ).toBeInTheDocument();
  });

  it("mobileMenuItemId が null のときドロップダウンを非表示にする", () => {
    render(<TodoItemMobileDropdown {...defaultProps} mobileMenuItemId={null} />);
    expect(
      screen.queryByLabelText("アクションメニュー"),
    ).not.toBeInTheDocument();
  });

  it("編集ボタンクリックで startEditItem と closeMobileMenu が呼ばれる", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /編集/ }));
    expect(defaultProps.startEditItem).toHaveBeenCalledWith("item-1", "テストTodo");
    expect(defaultProps.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("インデントを下げるボタンクリックで onOutdentItem と closeMobileMenu が呼ばれる", () => {
    render(<TodoItemMobileDropdown {...defaultProps} currentIndent={1} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを下げる/ }));
    expect(defaultProps.onOutdentItem).toHaveBeenCalledWith("list-1", "item-1");
    expect(defaultProps.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("currentIndent が 0 のときインデントを下げるボタンは disabled", () => {
    render(<TodoItemMobileDropdown {...defaultProps} currentIndent={0} />);
    expect(
      screen.getByRole("button", { name: /インデントを下げる/ }),
    ).toBeDisabled();
  });

  it("インデントを上げるボタンクリックで onIndentItem と closeMobileMenu が呼ばれる", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを上げる/ }));
    expect(defaultProps.onIndentItem).toHaveBeenCalledWith("list-1", "item-1");
    expect(defaultProps.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("currentIndent が maxIndent のときインデントを上げるボタンは disabled", () => {
    render(<TodoItemMobileDropdown {...defaultProps} currentIndent={3} maxIndent={3} />);
    expect(
      screen.getByRole("button", { name: /インデントを上げる/ }),
    ).toBeDisabled();
  });

  it("削除ボタンクリックで onDeleteItem と closeMobileMenu が呼ばれる", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(defaultProps.onDeleteItem).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "テストTodo",
    );
    expect(defaultProps.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("下に追加ボタンクリックで onInsertAfter と closeMobileMenu が呼ばれる", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /下に追加/ }));
    expect(defaultProps.onInsertAfter).toHaveBeenCalledTimes(1);
    expect(defaultProps.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("背景色の radiogroup を表示する", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("背景色スウォッチ選択で onUpdateItemBgColor と closeMobileMenu が呼ばれる", () => {
    render(<TodoItemMobileDropdown {...defaultProps} />);
    // index=1（赤: "bg-red-50"）を選択してデフォルト undefined を避ける
    const swatches = screen.getAllByRole("radio");
    fireEvent.click(swatches[1]);
    expect(defaultProps.onUpdateItemBgColor).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "bg-red-50",
    );
    expect(defaultProps.closeMobileMenu).toHaveBeenCalledTimes(1);
  });
});
