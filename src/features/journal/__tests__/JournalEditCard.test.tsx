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
  dateInput: "2024-01-10",
  today: "2024-01-12",
  titleInput: "先週の日記",
  contentInput: "先週はどうだったか",
  onTitleChange: jest.fn(),
  onContentChange: jest.fn(),
  onDateChange: jest.fn(),
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

  it("日付欄に dateInput を表示し、min は 1900-01-01、max は今日", () => {
    render(<JournalEditCard {...baseProps} dateInput="2024-01-05" />);

    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveAttribute("type", "date");
    expect(dateField).toHaveValue("2024-01-05");
    expect(dateField).toHaveAttribute("min", "1900-01-01");
    expect(dateField).toHaveAttribute("max", "2024-01-12");
  });

  it("dateInput が null（再読み込みで戻ったとき）は、エントリの日付を表示する", () => {
    render(<JournalEditCard {...baseProps} dateInput={null} />);

    expect(screen.getByLabelText("日付")).toHaveValue("2024-01-10");
  });

  it("日付欄を変更すると onDateChange が選んだ値で呼ばれる", () => {
    const onDateChange = jest.fn();
    render(<JournalEditCard {...baseProps} onDateChange={onDateChange} />);

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2024-01-08" },
    });
    expect(onDateChange).toHaveBeenCalledWith("2024-01-08");
  });

  it("日付欄を変えても、見出しは編集前の日付のまま", () => {
    render(<JournalEditCard {...baseProps} dateInput="2024-01-05" />);

    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "2024年1月10日(水) の記録を編集",
    );
  });
});
