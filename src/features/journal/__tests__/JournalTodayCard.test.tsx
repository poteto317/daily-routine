import { fireEvent, render, screen } from "@testing-library/react";
import type { JournalEntry } from "@/types/routine";
import { JournalTodayCard } from "../components/JournalTodayCard";

const baseEntry: JournalEntry = {
  id: "entry-1",
  date: "2024-01-12",
  title: "今日の日記",
  content: "今日は良い天気だった",
  createdAt: "2024-01-12T10:00:00.000Z",
  updatedAt: "2024-01-12T10:00:00.000Z",
};

const baseProps = {
  contentInput: "",
  editingEntry: null,
  showForm: false,
  titleInput: "",
  today: "2024-01-12",
  todayEntry: null,
  onCancel: jest.fn(),
  onContentChange: jest.fn(),
  onEditEntry: jest.fn(),
  onOpenForm: jest.fn(),
  onSave: jest.fn(),
  onUpdate: jest.fn(),
  onTitleChange: jest.fn(),
};

describe("JournalTodayCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("todayEntry なし・フォーム非表示のとき空ラベルを表示する", () => {
    render(<JournalTodayCard {...baseProps} />);

    expect(screen.getByText("まだ今日の記録はありません")).toBeInTheDocument();
  });

  it("todayEntry あり・フォーム非表示のときエントリと編集ボタンを表示する", () => {
    render(<JournalTodayCard {...baseProps} todayEntry={baseEntry} />);

    expect(screen.getByText("今日の日記")).toBeInTheDocument();
    expect(screen.getByText("今日は良い天気だった")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✏️ 編集" })).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onEditEntry が呼ばれる", () => {
    const onEditEntry = jest.fn();
    render(
      <JournalTodayCard
        {...baseProps}
        todayEntry={baseEntry}
        onEditEntry={onEditEntry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "✏️ 編集" }));
    expect(onEditEntry).toHaveBeenCalledWith(baseEntry);
  });

  it("フォーム表示・editingEntry なし(新規)のとき「保存」ボタンを表示する", () => {
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        titleInput="タイトル"
        contentInput="本文"
      />,
    );

    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "更新" }),
    ).not.toBeInTheDocument();
  });

  it("フォーム表示・editingEntry あり(編集中)のとき「更新」ボタンを表示する", () => {
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        editingEntry={baseEntry}
        titleInput="タイトル"
        contentInput="本文"
      />,
    );

    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });

  it("「保存」クリックで onSave が呼ばれる", () => {
    const onSave = jest.fn();
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        editingEntry={null}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("「更新」クリックで onUpdate が呼ばれる", () => {
    const onUpdate = jest.fn();
    render(
      <JournalTodayCard
        {...baseProps}
        showForm={true}
        editingEntry={baseEntry}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("「キャンセル」クリックで onCancel が呼ばれる", () => {
    const onCancel = jest.fn();
    render(
      <JournalTodayCard {...baseProps} showForm={true} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
