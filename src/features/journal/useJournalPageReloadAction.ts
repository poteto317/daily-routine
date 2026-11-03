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
  setDateInput: SetValue<string | null>;
  setRecentEntries: SetValue<JournalEntry[]>;
};

export const useJournalPageReloadAction = ({
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setDateInput,
  setRecentEntries,
}: UseJournalPageReloadActionParams) => {
  const loadData = useCallback(() => {
    createLoadJournalDataAction({
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setDateInput,
      setRecentEntries,
    })();
  }, [
    setContentInput,
    setDateInput,
    setRecentEntries,
    setTitleInput,
    setTodayEntry,
  ]);

  return createJournalPageReloadActionResult({ loadData });
};
