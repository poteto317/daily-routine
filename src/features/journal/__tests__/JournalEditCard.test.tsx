import { fireEvent, render, screen } from "@testing-library/react";
import type { JournalEntry } from "@/types/routine";
import { JournalEditCard } from "../components/JournalEditCard";

const pastEntry: JournalEntry = {
  id: "entry-past",
  date: "2024-01-10",
  title: "先週の日記",
  content: "先週はどうだったか",
  createdAt: "2024-01-10T10:00:00.000Z",
  updatedAt: "2024-01-10T10:00:00.000Z",
};

const baseProps = {
  editingEntry: pastEntry,
  titleInput: "先週の日記",
  contentInput: "先週はどうだったか",
  onTitleChange: jest.fn(),
  onContentChange: jest.fn(),
  onUpdate: jest.fn(),
  onCancel: jest.fn(),
};

describe("JournalEditCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集対象エントリの日付を見出しに含む", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("2024");
  });

  it("titleInput を入力フィールドに反映する", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(screen.getByDisplayValue("先週の日記")).toBeInTheDocument();
  });

  it("contentInput をテキストエリアに反映する", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(screen.getByDisplayValue("先週はどうだったか")).toBeInTheDocument();
  });

  it("タイトル入力変更で onTitleChange が呼ばれる", () => {
    const onTitleChange = jest.fn();
    render(<JournalEditCard {...baseProps} onTitleChange={onTitleChange} />);
    fireEvent.change(screen.getByDisplayValue("先週の日記"), {
      target: { value: "更新後タイトル" },
    });
    expect(onTitleChange).toHaveBeenCalledWith("更新後タイトル");
  });

  it("「更新」クリックで onUpdate が呼ばれる", () => {
    const onUpdate = jest.fn();
    render(<JournalEditCard {...baseProps} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("「キャンセル」クリックで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(<JournalEditCard {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("「保存」ボタンは表示しない（編集専用カードのため）", () => {
    render(<JournalEditCard {...baseProps} />);
    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });
});
