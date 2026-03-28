import type { JournalEntry, JournalHistory } from "@/types/routine";
export { getRecentJournalEntries } from "./journalRecentEntries";
import { getRecentJournalEntries } from "./journalRecentEntries";

type JournalPageData = {
  todayEntry: JournalEntry | null;
  titleInput: string;
  contentInput: string;
  recentEntries: JournalEntry[];
};

export const createJournalPageData = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): JournalPageData => {
  return {
    todayEntry,
    titleInput: "",
    contentInput: "",
    recentEntries: getRecentJournalEntries(history),
  };
};

export const resetJournalFormInputs = (): Pick<
  JournalPageData,
  "titleInput" | "contentInput"
> => {
  return {
    titleInput: "",
    contentInput: "",
  };
};
