import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { getJournalHistory, getTodayJournalEntry } from "./storage";
import { createReloadedJournalViewState } from "./journalViewStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export const createLoadJournalDataAction = (params: {
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setRecentEntries: SetValue<JournalEntry[]>;
}) => {
  const { setTodayEntry, setTitleInput, setContentInput, setRecentEntries } =
    params;

  return () => {
    const pageData = createReloadedJournalViewState(
      getTodayJournalEntry(),
      getJournalHistory(),
    );
    setTodayEntry(pageData.todayEntry);
    setTitleInput(pageData.titleInput);
    setContentInput(pageData.contentInput);
    setRecentEntries(pageData.recentEntries);
  };
};
