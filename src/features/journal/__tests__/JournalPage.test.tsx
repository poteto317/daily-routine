import { render, screen } from "@testing-library/react";
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("基本レイアウトとタイトル、JournalTodayCard、JournalRecentEntries をレンダリングする", () => {
    mockUseJournalPageState.mockReturnValue({
      today: "2026-03-15",
      todayEntry: sampleEntry,
      editingEntry: null,
      showForm: false,
      titleInput: "",
      contentInput: "",
      recentEntries: [sampleEntry],
      openForm: jest.fn(),
      openEditForm: jest.fn(),
      setEditingEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleUpdateEntry: jest.fn(),
      handleCancelForm: jest.fn(),
      handleDeleteEntry: jest.fn(),
    } as never);

    render(<JournalPage />);

    expect(screen.getByText(journalTexts.page.title)).toBeInTheDocument();
    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument();
  });

  it("過去の日記エントリを編集中の場合は JournalEditCard を表示する", () => {
    mockUseJournalPageState.mockReturnValue({
      today: "2026-03-15",
      todayEntry: sampleEntry,
      editingEntry: pastEntry,
      showForm: true,
      titleInput: "過去のタイトル",
      contentInput: "過去の内容編集",
      recentEntries: [sampleEntry, pastEntry],
      openForm: jest.fn(),
      openEditForm: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleUpdateEntry: jest.fn(),
      handleCancelForm: jest.fn(),
      handleDeleteEntry: jest.fn(),
    } as never);

    render(<JournalPage />);

    expect(screen.getByText(journalTexts.page.title)).toBeInTheDocument();
  });
});
