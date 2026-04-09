import { type JournalEntry } from "@/types/routine";
import { getJournalHistory } from "./storageData";

const getAllJournalEntries = (): JournalEntry[] => {
  return Object.values(getJournalHistory()).flat();
};

export const getJournalEntriesByPeriod = (
  startDate: string,
  endDate: string,
): JournalEntry[] => {
  return getAllJournalEntries()
    .filter((entry) => entry.date >= startDate && entry.date <= endDate)
    .sort((a, b) => {
      return (
        b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)
      );
    });
};

export const getLatestJournalEntry = (): JournalEntry | null => {
  const entries = getAllJournalEntries();
  if (entries.length === 0) return null;
  return entries.sort((a, b) => {
    return (
      b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)
    );
  })[0];
};
