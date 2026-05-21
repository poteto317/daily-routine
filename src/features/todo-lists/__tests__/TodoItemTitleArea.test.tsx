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
    onChangeTitle: jest.fn(),
    onCommitEdit: jest.fn(),
    onCancelEdit: jest.fn(),
    onToggle: jest.fn(),
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

    it("タイトルボタンをクリックすると onToggle が呼ばれる", () => {
      const onToggle = jest.fn();
      render(
        <TodoItemTitleArea {...defaultProps} isEditing={false} onToggle={onToggle} />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "「テストタスク」を完了にする" }),
      );
      expect(onToggle).toHaveBeenCalledTimes(1);
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

    it("Enter キーで onCommitEdit が呼ばれる", () => {
      const onCommitEdit = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テスト"
          onCommitEdit={onCommitEdit}
        />,
      );
      fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
      expect(onCommitEdit).toHaveBeenCalledTimes(1);
    });

    it("Escape キーで onCancelEdit が呼ばれる", () => {
      const onCancelEdit = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テスト"
          onCancelEdit={onCancelEdit}
        />,
      );
      fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
      expect(onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it("blur で onCommitEdit が呼ばれる", () => {
      const onCommitEdit = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle="テスト"
          onCommitEdit={onCommitEdit}
        />,
      );
      fireEvent.blur(screen.getByRole("textbox"));
      expect(onCommitEdit).toHaveBeenCalledTimes(1);
    });

    it("テキスト変更で onChangeTitle が呼ばれる", () => {
      const onChangeTitle = jest.fn();
      render(
        <TodoItemTitleArea
          {...defaultProps}
          isEditing={true}
          editingTitle=""
          onChangeTitle={onChangeTitle}
        />,
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "新しいタイトル" },
      });
      expect(onChangeTitle).toHaveBeenCalledWith("新しいタイトル");
    });
  });
});
