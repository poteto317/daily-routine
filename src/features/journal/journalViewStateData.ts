import type { JournalEntry, JournalHistory } from "@/types/routine";
import { createJournalPageData } from "./journalPageDataActions";

export type JournalViewState = {
  todayEntry: JournalEntry | null;
  titleInput: string;
  contentInput: string;
  recentEntries: JournalEntry[];
  showForm: boolean;
};

export const createInitialJournalViewState = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): JournalViewState => {
  const pageData = createJournalPageData(todayEntry, history);

  return {
    todayEntry: pageData.todayEntry,
    titleInput: pageData.titleInput,
    contentInput: pageData.contentInput,
    recentEntries: pageData.recentEntries,
    showForm: false,
  };
};

export const createReloadedJournalViewState = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): Omit<JournalViewState, "showForm"> => {
  const pageData = createJournalPageData(todayEntry, history);

  return {
    todayEntry: pageData.todayEntry,
    titleInput: pageData.titleInput,
    contentInput: pageData.contentInput,
    recentEntries: pageData.recentEntries,
  };
};
