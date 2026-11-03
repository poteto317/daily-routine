import { renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getJournalHistory: jest.fn(),
  getTodayJournalEntry: jest.fn(),
}));

jest.mock("../journalViewStateActions", () => ({
  createInitialJournalViewState: jest.fn(),
}));

import { createInitialJournalViewState } from "../journalViewStateActions";
import { getJournalHistory, getTodayJournalEntry } from "../storage";
import { useJournalPageDataState } from "../useJournalPageDataState";

describe("useJournalPageDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("storage と初期 view state から todayEntry/recentEntries を初期化する", () => {
    const todayEntry = {
      id: "today",
      date: "2024-01-12",
      title: "今日",
      content: "本文",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };
    const history = { [todayEntry.date]: [todayEntry] };
    const initialState = {
      todayEntry,
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
      recentEntries: [todayEntry],
    };
    (getTodayJournalEntry as jest.Mock).mockReturnValue(todayEntry);
    (getJournalHistory as jest.Mock).mockReturnValue(history);
    (createInitialJournalViewState as jest.Mock).mockReturnValue(initialState);

    const { result } = renderHook(() => useJournalPageDataState());

    expect(createInitialJournalViewState).toHaveBeenCalledWith(
      todayEntry,
      history,
    );
    expect(result.current.initialState).toBe(initialState);
    expect(result.current.todayEntry).toBe(todayEntry);
    expect(result.current.recentEntries).toEqual([todayEntry]);
  });
});
