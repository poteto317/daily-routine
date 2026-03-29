import { useCallback } from "react";
import { createUpdateJournalEntryHandler } from "./journalPageMutationHandlers";

type UseJournalUpdateEntryActionParams = {
  entryId: string;
  titleInput: string;
  contentInput: string;
  loadData: () => void;
  closeForm: () => void;
};

export const useJournalUpdateEntryAction = ({
  entryId,
  titleInput,
  contentInput,
  loadData,
  closeForm,
}: UseJournalUpdateEntryActionParams) => {
  return useCallback(() => {
    return createUpdateJournalEntryHandler({
      entryId,
      titleInput,
      contentInput,
      reloadData: loadData,
      closeForm,
    })();
  }, [entryId, titleInput, contentInput, loadData, closeForm]);
};
