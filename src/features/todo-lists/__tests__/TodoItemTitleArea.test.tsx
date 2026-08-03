import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemTitleArea } from "../TodoItemTitleArea";

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

describe("TodoItemTitleArea", () => {
  const defaultProps = {
    itemId: "item-1",
    title: "テストタスク",
    isCompleted: false,
    isEditing: false,
    editingTitle: "",
    isDragActive: false,
    isSelected: false,
    onChangeTitleAction: jest.fn(),
    onCommitEditAction: jest.fn(),
    onCancelEditAction: jest.fn(),
    onToggleAction: jest.fn(),
    onLongPressAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("表示モード（isEditing=false）", () => {
    it("タイトルボタンが表示される", () => {
      render(<TodoItemTitleArea {...defaultProps} isEditing={false} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      ).toBeInTheDocument();
    });

    it("入力フィールドは表示されない", () => {
      render(<TodoItemTitleArea {...defaultProps} isEditing={false} />);
      expect(
        screen.queryByRole("textbox"),
      ).not.toBeInTheDocument();
    });

    it("タイトルボタンに isDragActive と isCompleted が渡される", () => {
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={false}
          isCompleted={true}
          isDragActive={true}
        />,
      );
      const btn = screen.getByRole("button", {
        name: "「テストタスク」を未完了に戻す",
      });
      expect(btn).toHaveAttribute("aria-pressed", "true");
      expect(btn).toBeDisabled();
    });

    it("タイトルボタンをクリックすると onToggleAction が呼ばれる", () => {
      const onToggleAction = jest.fn();
      render(
        <TodoItemTitleArea {...defaultProps} isEditing={false} onToggleAction={onToggleAction} />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      );
      expect(onToggleAction).toHaveBeenCalledTimes(1);
    });

    it("isSelected=true のとき aria-label に（選択中）が反映される", () => {
      render(<TodoItemTitleArea {...defaultProps} isEditing={false} isSelected={true} />);
      expect(
        screen.getByRole("button", { name: "「テストタスク」を完了にする（選択中）" }),
      ).toBeInTheDocument();
    });
  });

  describe("編集モード（isEditing=true）", () => {
    it("テキスト入力フィールドが表示される", () => {
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="編集中テキスト"
        />,
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByDisplayValue("編集中テキスト")).toBeInTheDocument();
    });

    it("タイトルボタンは表示されない", () => {
      render(
        <TodoItemTitleArea {...defaultProps} isEditing={true} editingTitle="X" />,
      );
      expect(
        screen.queryByRole("button"),
      ).not.toBeInTheDocument();
    });

    it("aria-label に「のタイトルを編集」が含まれる", () => {
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テストタスク"
        />,
      );
      expect(
        screen.getByRole("textbox", { name: "「テストタスク」のタイトルを編集" }),
      ).toBeInTheDocument();
    });

    it("Enter キーで onCommitEditAction が呼ばれる", () => {
      const onCommitEditAction = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テスト"
          onCommitEditAction={onCommitEditAction}
        />,
      );
      fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
      expect(onCommitEditAction).toHaveBeenCalledTimes(1);
    });

    it("Escape キーで onCancelEditAction が呼ばれる", () => {
      const onCancelEditAction = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テスト"
          onCancelEditAction={onCancelEditAction}
        />,
      );
      fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
      expect(onCancelEditAction).toHaveBeenCalledTimes(1);
    });

    it("blur で onCommitEditAction が呼ばれる", () => {
      const onCommitEditAction = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テスト"
          onCommitEditAction={onCommitEditAction}
        />,
      );
      fireEvent.blur(screen.getByRole("textbox"));
      expect(onCommitEditAction).toHaveBeenCalledTimes(1);
    });

    it("テキスト変更で onChangeTitleAction が呼ばれる", () => {
      const onChangeTitleAction = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle=""
          onChangeTitleAction={onChangeTitleAction}
        />,
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "新しいタイトル" },
      });
      expect(onChangeTitleAction).toHaveBeenCalledWith("新しいタイトル");
    });
  });
});
