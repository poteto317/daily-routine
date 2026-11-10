import { fireEvent, render, screen } from "@testing-library/react";
import { JournalPage } from "../JournalPage";
import { useJournalPageState } from "../useJournalPageState";
import journalTexts from "../locales/ja.json";
import { type JournalEntry } from "@/types/routine";

jest.mock("../useJournalPageState");

const mockUseJournalPageState = useJournalPageState as jest.MockedFunction<
  typeof useJournalPageState
>;

describe("JournalPage", () => {
  const sampleEntry: JournalEntry = {
    id: "entry-1",
    date: "2026-03-15",
    title: "今日のタイトル",
    content: "今日の内容",
    createdAt: "2026-03-15T12:00:00Z",
    updatedAt: "2026-03-15T12:00:00Z",
  };

  const pastEntry: JournalEntry = {
    id: "entry-past",
    date: "2026-03-10",
    title: "過去のタイトル",
    content: "過去の内容",
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  };

  const createState = (overrides: Record<string, unknown> = {}) => ({
    today: "2026-03-15",
    todayEntry: sampleEntry,
    editingEntry: null,
    showForm: false,
    titleInput: "",
    contentInput: "",
    dateInput: null,
    recentEntries: [sampleEntry],
    openForm: jest.fn(),
    openEditForm: jest.fn(),
    setEditingEntry: jest.fn(),
    handleTitleChange: jest.fn(),
    handleContentChange: jest.fn(),
    handleDateChange: jest.fn(),
    handleSaveEntry: jest.fn(),
    handleUpdateEntry: jest.fn(),
    handleCancelForm: jest.fn(),
    handleDeleteEntry: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("基本レイアウトとタイトル、JournalTodayCard、JournalRecentEntries をレンダリングする", () => {
    mockUseJournalPageState.mockReturnValue(createState() as never);

    render(<JournalPage />);

    expect(screen.getByText(journalTexts.page.title)).toBeInTheDocument();
    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument();
  });

  it("週ごとの業務日誌の見出しは出ない（独立した画面に移した）", () => {
    mockUseJournalPageState.mockReturnValue(createState() as never);
    render(<JournalPage />);

    expect(
      screen.queryByRole("region", { name: journalTexts.weeklyLog.title }),
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { name: journalTexts.weeklyLog.title }),
    ).toBeNull();
  });

  it("過去の日記エントリを編集中の場合は JournalEditCard を表示する", () => {
    mockUseJournalPageState.mockReturnValue(
      createState({
        editingEntry: pastEntry,
        showForm: true,
        titleInput: "過去のタイトル",
        contentInput: "過去の内容編集",
        dateInput: pastEntry.date,
        recentEntries: [sampleEntry, pastEntry],
      }) as never,
    );

    render(<JournalPage />);

    expect(screen.getByText(journalTexts.page.title)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "2026年3月10日(火) の記録を編集",
      }),
    ).toBeInTheDocument();
  });

  it("新規フォームのタイトル・本文の入力を UI 用ハンドラへ渡す", () => {
    const handleTitleChange = jest.fn();
    const handleContentChange = jest.fn();
    mockUseJournalPageState.mockReturnValue(
      createState({
        todayEntry: null,
        showForm: true,
        handleTitleChange,
        handleContentChange,
      }) as never,
    );

    render(<JournalPage />);
    fireEvent.change(screen.getByPlaceholderText("例: 今日の出来事"), {
      target: { value: "題" },
    });
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "本文" },
    });

    expect(handleTitleChange).toHaveBeenCalledWith("題");
    expect(handleContentChange).toHaveBeenCalledWith("本文");
  });

  it("過去のエントリの編集カードでも、タイトル・本文の入力を UI 用ハンドラへ渡す", () => {
    const handleTitleChange = jest.fn();
    const handleContentChange = jest.fn();
    mockUseJournalPageState.mockReturnValue(
      createState({
        editingEntry: pastEntry,
        showForm: true,
        titleInput: pastEntry.title,
        contentInput: pastEntry.content,
        dateInput: pastEntry.date,
        handleTitleChange,
        handleContentChange,
      }) as never,
    );

    render(<JournalPage />);
    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "直した題" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "直した本文" },
    });

    expect(handleTitleChange).toHaveBeenCalledWith("直した題");
    expect(handleContentChange).toHaveBeenCalledWith("直した本文");
  });

  it("過去のエントリの編集カードに日付欄を渡し、変更を handleDateChange へ渡す", () => {
    const handleDateChange = jest.fn();
    mockUseJournalPageState.mockReturnValue(
      createState({
        editingEntry: pastEntry,
        showForm: true,
        titleInput: pastEntry.title,
        contentInput: pastEntry.content,
        dateInput: null,
        handleDateChange,
      }) as never,
    );

    render(<JournalPage />);
    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveValue("2026-03-10");
    expect(dateField).toHaveAttribute("max", "2026-03-15");

    fireEvent.change(dateField, { target: { value: "2026-03-08" } });
    expect(handleDateChange).toHaveBeenCalledWith("2026-03-08");
  });

  it("今日のカードの新規フォームに dateInput を渡し、見出しが選んだ日付に従う", () => {
    const handleDateChange = jest.fn();
    mockUseJournalPageState.mockReturnValue(
      createState({
        todayEntry: null,
        showForm: true,
        dateInput: "2026-03-12",
        handleDateChange,
      }) as never,
    );

    render(<JournalPage />);
    expect(screen.getByLabelText("日付")).toHaveValue("2026-03-12");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "2026年3月12日(木) の記録",
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-03-11" },
    });
    expect(handleDateChange).toHaveBeenCalledWith("2026-03-11");
  });
});
