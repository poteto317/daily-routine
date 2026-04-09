import { useState } from "react";
import { type JournalEntry } from "@/types/routine";
import { getJournalHistory, getTodayJournalEntry } from "./storage";
import { createInitialJournalViewState } from "./journalViewStateActions";

export const useJournalPageDataState = () => {
  const initialEntry = getTodayJournalEntry();
  const initialState = createInitialJournalViewState(
    initialEntry,
    getJournalHistory(),
  );
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(
    initialState.todayEntry,
  );
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>(
    initialState.recentEntries,
  );

  return {
    initialState,
    recentEntries,
    setRecentEntries,
    setTodayEntry,
    todayEntry,
  };
};
