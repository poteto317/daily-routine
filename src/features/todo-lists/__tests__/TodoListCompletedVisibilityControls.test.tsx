import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListCompletedVisibilityControls } from "../TodoListCompletedVisibilityControls";
import texts from "../locales/ja.json";

const defaultProps = {
  hasCompletedItems: true,
  hideCompleted: false,
  onToggleHideCompleted: jest.fn(),
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
  });
});
