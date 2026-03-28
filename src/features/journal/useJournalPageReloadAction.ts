import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { createJournalPageReloadActionResult } from "./journalPageReloadActionResult";
import { createLoadJournalDataAction } from "./journalPageReloadActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageReloadActionParams = {
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setRecentEntries: SetValue<JournalEntry[]>;
};

export const useJournalPageReloadAction = ({
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setRecentEntries,
}: UseJournalPageReloadActionParams) => {
  const loadData = useCallback(() => {
    createLoadJournalDataAction({
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setRecentEntries,
    })();
  }, [setContentInput, setRecentEntries, setTitleInput, setTodayEntry]);

  return createJournalPageReloadActionResult({ loadData });
};
