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
  dateInput: null,
  editingEntry: null,
  showForm: false,
  titleInput: "",
  today: "2024-01-12",
  todayEntry: null,
  onCancel: jest.fn(),
  onContentChange: jest.fn(),
  onDateChange: jest.fn(),
  onEditEntry: jest.fn(),
  onOpenForm: jest.fn(),
  onSave: jest.fn(),
  onUpdate: jest.fn(),
  onTitleChange: jest.fn(),
};

// 今日のカードの見出し（h2）の文字列
const headingText = () => screen.getByRole("heading", { level: 2 }).textContent;

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

  describe("日付欄と見出し", () => {
    it("フォームを閉じているときは日付欄を出さず、見出しは今日", () => {
      render(<JournalTodayCard {...baseProps} />);

      expect(screen.queryByLabelText("日付")).not.toBeInTheDocument();
      expect(headingText()).toBe("今日の記録 (2024年1月12日(金))");
    });

    it("新規で未操作（null）なら、日付欄は今日で max も今日、min は 1900-01-01", () => {
      render(<JournalTodayCard {...baseProps} showForm={true} />);

      const dateField = screen.getByLabelText("日付");
      expect(dateField).toHaveAttribute("type", "date");
      expect(dateField).toHaveValue("2024-01-12");
      expect(dateField).toHaveAttribute("min", "1900-01-01");
      expect(dateField).toHaveAttribute("max", "2024-01-12");
      expect(headingText()).toBe("今日の記録 (2024年1月12日(金))");
    });

    it("新規で過去の日付を選ぶと、日付欄はその日付で、見出しは「<日付> の記録」", () => {
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          dateInput="2024-01-10"
        />,
      );

      expect(screen.getByLabelText("日付")).toHaveValue("2024-01-10");
      expect(headingText()).toBe("2024年1月10日(水) の記録");
    });

    it.each(["", "123456-01-01"])(
      "新規で日付欄が空・不正（%s）なら、見出しは「今日の記録」だけ",
      (dateInput) => {
        render(
          <JournalTodayCard
            {...baseProps}
            showForm={true}
            dateInput={dateInput}
          />,
        );

        expect(headingText()).toBe("今日の記録");
      },
    );

    it("日付欄を変更すると onDateChange が選んだ値で呼ばれる", () => {
      const onDateChange = jest.fn();
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          onDateChange={onDateChange}
        />,
      );

      fireEvent.change(screen.getByLabelText("日付"), {
        target: { value: "2024-01-11" },
      });
      expect(onDateChange).toHaveBeenCalledWith("2024-01-11");
    });

    it("編集で未操作（null）なら、日付欄はエントリの日付", () => {
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          editingEntry={baseEntry}
          dateInput={null}
        />,
      );

      expect(screen.getByLabelText("日付")).toHaveValue("2024-01-12");
    });

    it("編集で日付欄を変えても、見出しは編集前の日付（今日）のまま", () => {
      render(
        <JournalTodayCard
          {...baseProps}
          showForm={true}
          editingEntry={baseEntry}
          dateInput="2024-01-10"
        />,
      );

      expect(screen.getByLabelText("日付")).toHaveValue("2024-01-10");
      expect(headingText()).toBe("今日の記録 (2024年1月12日(金))");
    });
  });
});
