import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemTitleButton } from "../TodoItemTitleButton";

describe("TodoItemTitleButton", () => {
  const defaultProps = {
    title: "テストタスク",
    isCompleted: false,
    isDragActive: false,
    isSelected: false,
    onToggleAction: jest.fn(),
    onLongPressAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("aria-label", () => {
    it("未完了のとき「{title}」を完了にする が設定される", () => {
      render(<TodoItemTitleButton {...defaultProps} isCompleted={false} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      ).toBeInTheDocument();
    });

    it("完了済みのとき「{title}」を未完了に戻す が設定される", () => {
      render(<TodoItemTitleButton {...defaultProps} isCompleted={true} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を未完了に戻す" }),
      ).toBeInTheDocument();
    });

    it("タイトルが変わると aria-label も変わる", () => {
      render(
        <TodoItemTitleButton {...defaultProps} title="別のタスク" isCompleted={false} />,
      );
      expect(
        screen.getByRole("button", { name: "「別のタスク」を完了にする" }),
      ).toBeInTheDocument();
    });

    it("isSelected=true のとき aria-label の末尾に（選択中）が付く", () => {
      render(<TodoItemTitleButton {...defaultProps} isSelected={true} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする（選択中）" }),
      ).toBeInTheDocument();
    });

    it("isSelected=false のとき（選択中）は付かない", () => {
      render(<TodoItemTitleButton {...defaultProps} isSelected={false} />);
      expect(
        screen.queryByRole("button", { name: /選択中/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("aria-pressed", () => {
    it("未完了のとき aria-pressed が false", () => {
      render(<TodoItemTitleButton {...defaultProps} isCompleted={false} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("完了済みのとき aria-pressed が true", () => {
      render(<TodoItemTitleButton {...defaultProps} isCompleted={true} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を未完了に戻す" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("disabled 制御", () => {
    it("isDragActive=false のとき disabled ではない", () => {
      render(<TodoItemTitleButton {...defaultProps} isDragActive={false} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      ).not.toBeDisabled();
    });

    it("isDragActive=true のとき disabled になる", () => {
      render(<TodoItemTitleButton {...defaultProps} isDragActive={true} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      ).toBeDisabled();
    });
  });

  describe("クリック動作", () => {
    it("クリックで onToggleAction が呼ばれる", () => {
      const onToggleAction = jest.fn();
      render(<TodoItemTitleButton {...defaultProps} onToggleAction={onToggleAction} />);
      fireEvent.click(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      );
      expect(onToggleAction).toHaveBeenCalledTimes(1);
    });

    it("isDragActive=true のとき クリックしても onToggleAction は呼ばれない", () => {
      const onToggleAction = jest.fn();
      render(
        <TodoItemTitleButton {...defaultProps} isDragActive={true} onToggleAction={onToggleAction} />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      );
      expect(onToggleAction).not.toHaveBeenCalled();
    });
  });

  describe("長押し動作", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it("短いタップ（500ms未満で指を離す）では onToggleAction が呼ばれ onLongPressAction は呼ばれない", () => {
      const onToggleAction = jest.fn();
      const onLongPressAction = jest.fn();
      render(
        <TodoItemTitleButton
          {...defaultProps}
          onToggleAction={onToggleAction}
          onLongPressAction={onLongPressAction}
        />,
      );
      const btn = screen.getByRole("button", { name: "「テストタスク」を完了にする" });

      fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
      jest.advanceTimersByTime(300);
      fireEvent.pointerUp(btn);
      fireEvent.click(btn);

      expect(onLongPressAction).not.toHaveBeenCalled();
      expect(onToggleAction).toHaveBeenCalledTimes(1);
    });

    it("500ms長押しすると onLongPressAction が呼ばれ、onToggleAction は呼ばれない", () => {
      const onToggleAction = jest.fn();
      const onLongPressAction = jest.fn();
      render(
        <TodoItemTitleButton
          {...defaultProps}
          onToggleAction={onToggleAction}
          onLongPressAction={onLongPressAction}
        />,
      );
      const btn = screen.getByRole("button", { name: "「テストタスク」を完了にする" });

      fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
      jest.advanceTimersByTime(500);
      fireEvent.pointerUp(btn);
      fireEvent.click(btn);

      expect(onLongPressAction).toHaveBeenCalledTimes(1);
      expect(onToggleAction).not.toHaveBeenCalled();
    });

    it("長押し中に isDragActive が true になると onLongPressAction は発火しない（他アイテムのドラッグ開始等）", () => {
      const onLongPressAction = jest.fn();
      const { rerender } = render(
        <TodoItemTitleButton
          {...defaultProps}
          isDragActive={false}
          onLongPressAction={onLongPressAction}
        />,
      );
      const btn = screen.getByRole("button", { name: "「テストタスク」を完了にする" });

      fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
      jest.advanceTimersByTime(200);

      rerender(
        <TodoItemTitleButton
          {...defaultProps}
          isDragActive={true}
          onLongPressAction={onLongPressAction}
        />,
      );
      jest.advanceTimersByTime(500);

      expect(onLongPressAction).not.toHaveBeenCalled();
    });
  });

  describe("スタイル", () => {
    it("未完了のとき取り消し線クラスがない", () => {
      render(<TodoItemTitleButton {...defaultProps} isCompleted={false} />);
      const btn = screen.getByRole("button", {
        name: "「テストタスク」を完了にする",
      });
      expect(btn).not.toHaveClass("line-through");
    });

    it("完了済みのとき取り消し線クラスがある", () => {
      render(<TodoItemTitleButton {...defaultProps} isCompleted={true} />);
      const btn = screen.getByRole("button", {
        name: "「テストタスク」を未完了に戻す",
      });
      expect(btn).toHaveClass("line-through");
    });
  });

  describe("タイトルの表示", () => {
    it("title が表示される", () => {
      render(<TodoItemTitleButton {...defaultProps} title="My Task" />);
      expect(screen.getByText("My Task")).toBeInTheDocument();
    });
  });
});
