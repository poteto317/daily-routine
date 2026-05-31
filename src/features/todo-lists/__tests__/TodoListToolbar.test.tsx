import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListToolbar } from "../TodoListToolbar";
import type { TodoListItem } from "../types";

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: `item-${Math.random()}`,
  title: "テスト",
  isCompleted: false,
  indent: 0,
  bgColor: undefined,
  createdAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const defaultProps = {
  items: [createItem(), createItem()],
  addItemPosition: "last" as const,
  hideCompleted: false,
  showBulkColorPicker: false,
  hasCompletedItems: false,
  onToggleBulkColorPicker: jest.fn(),
  onCloseBulkColorPicker: jest.fn(),
  onUpdateAllItemsBgColor: jest.fn(),
  onToggleListAddItemPosition: jest.fn(),
  onToggleHideCompleted: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListToolbar", () => {
  it("一括背景色ボタンを表示する", () => {
    render(<TodoListToolbar {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "一括背景色変更" }),
    ).toBeInTheDocument();
  });

  it("一括背景色ボタンクリックで onToggleBulkColorPicker が呼ばれる", () => {
    render(<TodoListToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "一括背景色変更" }));
    expect(defaultProps.onToggleBulkColorPicker).toHaveBeenCalledTimes(1);
  });

  it("showBulkColorPicker=false のときカラーピッカーを非表示にする", () => {
    render(<TodoListToolbar {...defaultProps} showBulkColorPicker={false} />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("showBulkColorPicker=true のときカラーピッカーを表示する", () => {
    render(<TodoListToolbar {...defaultProps} showBulkColorPicker />);
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("カラースウォッチ選択で onUpdateAllItemsBgColor と onCloseBulkColorPicker が呼ばれる", () => {
    render(<TodoListToolbar {...defaultProps} showBulkColorPicker />);
    fireEvent.click(screen.getByRole("radio", { name: "赤" }));
    expect(defaultProps.onUpdateAllItemsBgColor).toHaveBeenCalledWith("bg-red-50");
    expect(defaultProps.onCloseBulkColorPicker).toHaveBeenCalledTimes(1);
  });

  it("hasCompletedItems=false のとき完了済みトグルを表示しない", () => {
    render(<TodoListToolbar {...defaultProps} hasCompletedItems={false} />);
    expect(
      screen.queryByRole("button", { name: /完了済み/ }),
    ).not.toBeInTheDocument();
  });

  it("hasCompletedItems=true のとき完了済みトグルボタンを表示する", () => {
    render(<TodoListToolbar {...defaultProps} hasCompletedItems />);
    expect(screen.getByRole("button", { name: "完了済みを非表示" })).toBeInTheDocument();
  });

  it("hideCompleted=true のとき「完了済みを表示」ボタンを表示する", () => {
    render(
      <TodoListToolbar {...defaultProps} hasCompletedItems hideCompleted />,
    );
    expect(screen.getByRole("button", { name: "完了済みを表示" })).toBeInTheDocument();
  });

  it("完了済みトグルクリックで onToggleHideCompleted が呼ばれる", () => {
    render(<TodoListToolbar {...defaultProps} hasCompletedItems />);
    fireEvent.click(screen.getByRole("button", { name: "完了済みを非表示" }));
    expect(defaultProps.onToggleHideCompleted).toHaveBeenCalledTimes(1);
  });

  it("追加位置トグルボタンを表示する（末尾追加がデフォルト）", () => {
    render(<TodoListToolbar {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "末尾に追加" }),
    ).toBeInTheDocument();
  });

  it("addItemPosition=first のとき先頭追加ボタンを表示する", () => {
    render(<TodoListToolbar {...defaultProps} addItemPosition="first" />);
    expect(
      screen.getByRole("button", { name: "先頭に追加" }),
    ).toBeInTheDocument();
  });
});
