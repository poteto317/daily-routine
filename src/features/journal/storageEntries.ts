import { type JournalEntry } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import { getJournalHistory, saveJournalHistory } from "./storageData";
import { getTodayDateString } from "./utils/journalDate";

const sortEntriesByLatest = (entries: JournalEntry[]): JournalEntry[] => {
  return [...entries].sort((left, right) => {
    return right.updatedAt.localeCompare(left.updatedAt);
  });
};

export const getJournalEntries = (date: string): JournalEntry[] => {
  const history = getJournalHistory();
  return sortEntriesByLatest(history[date] ?? []);
};

export const getJournalEntry = (date: string): JournalEntry | null => {
  return getJournalEntries(date)[0] ?? null;
};

export const getTodayJournalEntry = (): JournalEntry | null => {
  const today = getTodayDateString();
  return getJournalEntry(today);
};

export const saveJournalEntry = (
  date: string,
  title: string,
  content: string,
): void => {
  const history = getJournalHistory();
  const now = new Date().toISOString();

  history[date] = [
    ...(history[date] ?? []),
    {
      id: generateId("journal"),
      date,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    },
  ];

  saveJournalHistory(history);
};

export const updateJournalEntry = (
  entryId: string,
  title: string,
  content: string,
): void => {
  const history = getJournalHistory();
  const now = new Date().toISOString();
  const nextHistory = Object.fromEntries(
    Object.entries(history).map(([date, entries]) => [
      date,
      entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, title, content, updatedAt: now }
          : entry,
      ),
    ]),
  );

  saveJournalHistory(nextHistory);
};

export const deleteJournalEntry = (entryId: string): void => {
  const history = getJournalHistory();
  const nextHistory = Object.fromEntries(
    Object.entries(history)
      .map(([date, entries]) => [
        date,
        entries.filter((entry) => entry.id !== entryId),
      ])
      .filter(([, entries]) => entries.length > 0),
  );

  saveJournalHistory(nextHistory);
};
