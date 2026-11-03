import { createLoadJournalDataAction } from "../journalPageReloadActions";
import { createReloadedJournalViewState } from "../journalViewStateActions";
import { getJournalHistory, getTodayJournalEntry } from "../storage";

jest.mock("../journalViewStateActions", () => ({
  createReloadedJournalViewState: jest.fn(),
}));

jest.mock("../storage", () => ({
  getJournalHistory: jest.fn(),
  getTodayJournalEntry: jest.fn(),
}));

describe("journalPageReloadActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("load action が storage と view state をつないで setter に反映する（日付は null に戻す）", () => {
    const todayEntry = {
      id: "today",
      date: "2024-01-12",
      title: "今日",
      content: "本文",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };
    const history = { [todayEntry.date]: [todayEntry] };
    const viewState = {
      todayEntry,
      titleInput: "",
      contentInput: "",
      dateInput: null,
      recentEntries: [todayEntry],
    };
    const setTodayEntry = jest.fn();
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setDateInput = jest.fn();
    const setRecentEntries = jest.fn();

    (getTodayJournalEntry as jest.Mock).mockReturnValue(todayEntry);
    (getJournalHistory as jest.Mock).mockReturnValue(history);
    (createReloadedJournalViewState as jest.Mock).mockReturnValue(viewState);

    createLoadJournalDataAction({
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setDateInput,
      setRecentEntries,
    })();

    expect(createReloadedJournalViewState).toHaveBeenCalledWith(
      todayEntry,
      history,
    );
    expect(setTodayEntry).toHaveBeenCalledWith(todayEntry);
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setContentInput).toHaveBeenCalledWith("");
    expect(setDateInput).toHaveBeenCalledWith(null);
    expect(setRecentEntries).toHaveBeenCalledWith([todayEntry]);
  });
});
