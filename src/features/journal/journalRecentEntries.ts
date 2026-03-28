import type { JournalEntry, JournalHistory } from "@/types/routine";

export const getRecentJournalEntries = (
  history: JournalHistory,
): JournalEntry[] => {
  return Object.values(history)
    .flat()
    .sort((left, right) => {
      return (
        right.date.localeCompare(left.date) ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    })
    .slice(0, 30);
};
