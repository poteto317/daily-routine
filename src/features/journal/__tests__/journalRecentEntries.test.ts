import type { JournalEntry } from "@/types/routine";
import { getRecentJournalEntries } from "../journalRecentEntries";

describe("journalRecentEntries", () => {
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

  it("recent entries を新しい日付順で返す", () => {
    const entries = getRecentJournalEntries({
      [entryA.date]: [entryA],
      [entryB.date]: [entryB],
    });

    expect(entries).toEqual([entryB, entryA]);
  });

  it("同じ日付なら更新日時の新しい順で返す", () => {
    const older = {
      ...entryA,
      id: "older",
      updatedAt: "2024-01-10T09:00:00.000Z",
    };
    const newer = {
      ...entryA,
      id: "newer",
      updatedAt: "2024-01-10T12:00:00.000Z",
    };

    const entries = getRecentJournalEntries({
      [entryA.date]: [older, newer],
    });

    expect(entries).toEqual([newer, older]);
  });
});
