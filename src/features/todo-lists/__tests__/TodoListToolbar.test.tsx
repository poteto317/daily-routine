import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../TodoListCompletedVisibilityControls", () => ({
  TodoListCompletedVisibilityControls: jest.fn(() => (
    <div data-testid="completed-visibility-controls" />
  )),
}));

import { TodoListCompletedVisibilityControls } from "../TodoListCompletedVisibilityControls";
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
  describe("一括背景色ピッカー", () => {
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
      expect(
        screen.getByRole("radiogroup", { name: "背景色" }),
      ).toBeInTheDocument();
    });

    it("カラースウォッチ選択で onUpdateAllItemsBgColor と onCloseBulkColorPicker が呼ばれる", () => {
      render(<TodoListToolbar {...defaultProps} showBulkColorPicker />);
      fireEvent.click(screen.getByRole("radio", { name: "赤" }));
      expect(defaultProps.onUpdateAllItemsBgColor).toHaveBeenCalledWith("bg-red-50");
      expect(defaultProps.onCloseBulkColorPicker).toHaveBeenCalledTimes(1);
    });
  });

  describe("追加位置トグル", () => {
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

  describe("historyControls スロット", () => {
    it("historyControls が渡されると左エリアに描画される", () => {
      render(
        <TodoListToolbar
          {...defaultProps}
          historyControls={<span data-testid="history-slot">↩↪</span>}
        />,
      );
      expect(screen.getByTestId("history-slot")).toBeInTheDocument();
    });

    it("historyControls が渡されない場合は何も描画されない", () => {
      render(<TodoListToolbar {...defaultProps} />);
      expect(screen.queryByTestId("history-slot")).not.toBeInTheDocument();
    });
  });

  describe("TodoListCompletedVisibilityControls への委譲", () => {
    it("TodoListCompletedVisibilityControls を描画する", () => {
      render(<TodoListToolbar {...defaultProps} />);
      expect(
        screen.getByTestId("completed-visibility-controls"),
      ).toBeInTheDocument();
    });

    it("完了済み表示制御の props を正しく渡す", () => {
      const props = {
        ...defaultProps,
        hasCompletedItems: true,
        hideCompleted: true,
        onToggleHideCompleted: jest.fn(),
      };

      render(<TodoListToolbar {...props} />);

      expect(TodoListCompletedVisibilityControls).toHaveBeenCalledWith(
        expect.objectContaining({
          hasCompletedItems: true,
          hideCompleted: true,
          onToggleHideCompleted: props.onToggleHideCompleted,
        }),
        undefined,
      );
    });
  });
});
