import type { JournalEntry } from "@/types/routine";

jest.mock("../journalPageDataActions", () => ({
  createJournalPageData: jest.fn(),
}));

import { createJournalPageData } from "../journalPageDataActions";
import {
  createInitialJournalViewState,
  createReloadedJournalViewState,
} from "../journalViewStateData";

describe("journalViewStateData", () => {
  const entry: JournalEntry = {
    id: "entry-1",
    date: "2024-01-12",
    title: "既存タイトル",
    content: "既存本文",
    createdAt: "2024-01-12T00:00:00.000Z",
    updatedAt: "2024-01-12T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createJournalPageData as jest.Mock).mockReturnValue({
      todayEntry: entry,
      titleInput: "",
      contentInput: "",
      recentEntries: [entry],
    });
  });

  it("初期 state 用の view data を生成する", () => {
    expect(
      createInitialJournalViewState(entry, { [entry.date]: [entry] }),
    ).toEqual({
      todayEntry: entry,
      titleInput: "",
      contentInput: "",
      recentEntries: [entry],
      showForm: false,
    });
    expect(createJournalPageData).toHaveBeenCalledWith(entry, {
      [entry.date]: [entry],
    });
  });

  it("再読込用の view data を生成する", () => {
    (createJournalPageData as jest.Mock).mockReturnValue({
      todayEntry: null,
      titleInput: "",
      contentInput: "",
      recentEntries: [entry],
    });

    expect(
      createReloadedJournalViewState(null, { [entry.date]: [entry] }),
    ).toEqual({
      todayEntry: null,
      titleInput: "",
      contentInput: "",
      recentEntries: [entry],
    });
    expect(createJournalPageData).toHaveBeenCalledWith(null, {
      [entry.date]: [entry],
    });
  });
});
