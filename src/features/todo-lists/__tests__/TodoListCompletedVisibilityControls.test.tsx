import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListCompletedVisibilityControls } from "../TodoListCompletedVisibilityControls";
import texts from "../locales/ja.json";

const defaultProps = {
  hasCompletedItems: true,
  hideCompleted: false,
  moveCompletedToBottom: false,
  groupByCategory: false,
  onToggleHideCompleted: jest.fn(),
  onToggleMoveCompletedToBottom: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListCompletedVisibilityControls", () => {
  describe("hasCompletedItems=false のとき", () => {
    it("何も表示しない", () => {
      const { container } = render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          hasCompletedItems={false}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("完了済みを非表示/表示 トグル", () => {
    it("hideCompleted=false のとき現在の状態を表す「完了済みを表示」ボタンを表示する", () => {
      render(<TodoListCompletedVisibilityControls {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "完了済みを表示" }),
      ).toBeInTheDocument();
    });

    it("hideCompleted=true のとき現在の状態を表す「完了済みを非表示」ボタンを表示する", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          hideCompleted
        />,
      );
      expect(
        screen.getByRole("button", { name: "完了済みを非表示" }),
      ).toBeInTheDocument();
    });

    it("完了済みトグルクリックで onToggleHideCompleted が呼ばれる", () => {
      render(<TodoListCompletedVisibilityControls {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: "完了済みを表示" }));
      expect(defaultProps.onToggleHideCompleted).toHaveBeenCalledTimes(1);
    });

    it("hideCompleted=false のとき aria-pressed が false", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          hideCompleted={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "完了済みを表示" }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("hideCompleted=true のとき aria-pressed が true", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          hideCompleted
        />,
      );
      expect(
        screen.getByRole("button", { name: "完了済みを非表示" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("完了済みを下へ移動 トグル", () => {
    it("moveCompletedToBottom=false のとき現在の状態を表す「元の順番で表示」ボタンを表示する", () => {
      render(<TodoListCompletedVisibilityControls {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "元の順番で表示" }),
      ).toBeInTheDocument();
    });

    it("moveCompletedToBottom=true のとき現在の状態を表す「完了済みを下へ移動」ボタンを表示する", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          moveCompletedToBottom
        />,
      );
      expect(
        screen.getByRole("button", { name: "完了済みを下へ移動" }),
      ).toBeInTheDocument();
    });

    it("hideCompleted=true のとき完了済み並び替えトグルを表示しない", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          hideCompleted
        />,
      );
      expect(
        screen.queryByRole("button", { name: /下へ移動|元の順番/ }),
      ).not.toBeInTheDocument();
    });

    it("groupByCategory=true のとき完了済み並び替えトグルを表示しない（グルーピング中は常に末尾固定でトグルが無効化されるため）", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          groupByCategory
        />,
      );
      expect(
        screen.queryByRole("button", { name: /下へ移動|元の順番/ }),
      ).not.toBeInTheDocument();
    });

    it("groupByCategory=true でも完了済み表示/非表示トグルは表示される", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          groupByCategory
        />,
      );
      expect(
        screen.getByRole("button", { name: "完了済みを表示" }),
      ).toBeInTheDocument();
    });

    it("「元の順番で表示」クリックで onToggleMoveCompletedToBottom が呼ばれる", () => {
      render(<TodoListCompletedVisibilityControls {...defaultProps} />);
      fireEvent.click(
        screen.getByRole("button", { name: "元の順番で表示" }),
      );
      expect(defaultProps.onToggleMoveCompletedToBottom).toHaveBeenCalledTimes(1);
    });

    it("moveCompletedToBottom=false のとき aria-pressed が false", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          moveCompletedToBottom={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "元の順番で表示" }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("moveCompletedToBottom=true のとき aria-pressed が true", () => {
      render(
        <TodoListCompletedVisibilityControls
          {...defaultProps}
          moveCompletedToBottom
        />,
      );
      expect(
        screen.getByRole("button", { name: "完了済みを下へ移動" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("ロケールキーと表示ラベルの対応関係（キー名と真偽値の対応がズレる回帰の防止）", () => {
    it.each([
      { hideCompleted: false, expectedKey: "completedVisibleLabel" as const },
      { hideCompleted: true, expectedKey: "completedHiddenLabel" as const },
    ])(
      "hideCompleted=$hideCompleted のとき texts.list.$expectedKey がそのまま表示される",
      ({ hideCompleted, expectedKey }) => {
        render(
          <TodoListCompletedVisibilityControls
            {...defaultProps}
            hideCompleted={hideCompleted}
          />,
        );
        expect(
          screen.getByRole("button", { name: texts.list[expectedKey] }),
        ).toBeInTheDocument();
      },
    );

    it.each([
      {
        moveCompletedToBottom: false,
        expectedKey: "completedOriginalOrderLabel" as const,
      },
      {
        moveCompletedToBottom: true,
        expectedKey: "completedMovedToBottomLabel" as const,
      },
    ])(
      "moveCompletedToBottom=$moveCompletedToBottom のとき texts.list.$expectedKey がそのまま表示される",
      ({ moveCompletedToBottom, expectedKey }) => {
        render(
          <TodoListCompletedVisibilityControls
            {...defaultProps}
            moveCompletedToBottom={moveCompletedToBottom}
          />,
        );
        expect(
          screen.getByRole("button", { name: texts.list[expectedKey] }),
        ).toBeInTheDocument();
      },
    );
  });
});
