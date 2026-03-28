import type { JournalEntry } from "@/types/routine";
import {
  createJournalPageData,
  resetJournalFormInputs,
} from "../journalPageDataActions";

jest.mock("../journalRecentEntries", () => ({
  getRecentJournalEntries: jest.fn(),
}));

import { getRecentJournalEntries } from "../journalRecentEntries";

describe("journalPageDataActions", () => {
  const entryA: JournalEntry = {
    id: "a",
    date: "2024-01-10",
    title: "A",
    content: "alpha",
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  };
  const entryB: JournalEntry = {
    id: "b",
    date: "2024-01-12",
    title: "B",
    content: "beta",
    createdAt: "2024-01-12T00:00:00.000Z",
    updatedAt: "2024-01-12T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getRecentJournalEntries as jest.Mock).mockReturnValue([entryB, entryA]);
  });

  it("recent entries 計算を委譲して page data を生成する", () => {
    expect(createJournalPageData(entryA, { [entryA.date]: [entryA] })).toEqual({
      todayEntry: entryA,
      titleInput: "",
      contentInput: "",
      recentEntries: [entryB, entryA],
    });
    expect(getRecentJournalEntries).toHaveBeenCalledWith({
      [entryA.date]: [entryA],
    });
  });

  it("cancel 時のフォーム入力を空に戻す", () => {
    expect(resetJournalFormInputs()).toEqual({
      titleInput: "",
      contentInput: "",
    });
  });
});
