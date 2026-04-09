import { type JournalEntry, type JournalHistory } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_JOURNAL = "journal-history";
const DEFAULT_JOURNAL_HISTORY: JournalHistory = {};

type LegacyJournalHistory = Record<string, JournalEntry | JournalEntry[]>;

const normalizeJournalEntries = (
  entries: JournalEntry | JournalEntry[] | undefined,
): JournalEntry[] => {
  if (!entries) return [];
  return Array.isArray(entries) ? entries : [entries];
};

export const getJournalHistory = (): JournalHistory => {
  const history = getStorageItem<LegacyJournalHistory>(
    STORAGE_KEY_JOURNAL,
    DEFAULT_JOURNAL_HISTORY,
  );

  return Object.fromEntries(
    Object.entries(history)
      .map(([date, entries]) => [date, normalizeJournalEntries(entries)])
      .filter(([, entries]) => entries.length > 0),
  );
};

export const saveJournalHistory = (history: JournalHistory): void => {
  setStorageItem(STORAGE_KEY_JOURNAL, history);
};
