import { type JournalEntry } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import { getJournalHistory, saveJournalHistory } from "./storageData";
import { getTodayDateString } from "./utils/journalDate";
import { applyJournalEntryUpdate } from "./journalHistoryUpdate";

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

/**
 * 履歴を読み、applyJournalEntryUpdate で更新を当てて 1 回だけ書き込む
 * （見つからないときも内容を変えずに書き込む）。date を省略すると日付も置き場所も変えない。
 */
export const updateJournalEntry = (
  entryId: string,
  title: string,
  content: string,
  date?: string,
): void => {
  const history = getJournalHistory();
  saveJournalHistory(
    applyJournalEntryUpdate(
      history,
      entryId,
      { title, content, date },
      new Date().toISOString(),
    ),
  );
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
