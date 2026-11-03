import { useCallback } from "react";
import { createUpdateJournalEntryHandler } from "./journalPageMutationHandlers";
import { getTodayDateString } from "./utils/journalDate";

type UseJournalUpdateEntryActionParams = {
  entryId: string;
  originalDate: string;
  dateInput: string | null;
  titleInput: string;
  contentInput: string;
  loadData: () => void;
  closeForm: () => void;
};

export const useJournalUpdateEntryAction = ({
  entryId,
  originalDate,
  dateInput,
  titleInput,
  contentInput,
  loadData,
  closeForm,
}: UseJournalUpdateEntryActionParams) => {
  return useCallback(() => {
    return createUpdateJournalEntryHandler({
      entryId,
      originalDate,
      dateInput,
      getToday: getTodayDateString,
      titleInput,
      contentInput,
      reloadData: loadData,
      closeForm,
    })();
  }, [
    entryId,
    originalDate,
    dateInput,
    titleInput,
    contentInput,
    loadData,
    closeForm,
  ]);
};
