import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createSaveJournalEntryHandler } from "./journalPageMutationHandlers";
import { getTodayDateString } from "./utils/journalDate";

type UseJournalSaveEntryActionParams = {
  titleInput: string;
  contentInput: string;
  loadData: () => void;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

export const useJournalSaveEntryAction = ({
  titleInput,
  contentInput,
  loadData,
  setShowForm,
}: UseJournalSaveEntryActionParams) => {
  return useCallback(() => {
    return createSaveJournalEntryHandler({
      getToday: getTodayDateString,
      titleInput,
      contentInput,
      reloadData: loadData,
      closeForm: () => setShowForm(false),
    })();
  }, [contentInput, loadData, setShowForm, titleInput]);
};
