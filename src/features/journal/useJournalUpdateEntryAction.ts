import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createUpdateJournalEntryHandler } from "./journalPageMutationHandlers";

type UseJournalUpdateEntryActionParams = {
  entryId: string;
  titleInput: string;
  contentInput: string;
  loadData: () => void;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

export const useJournalUpdateEntryAction = ({
  entryId,
  titleInput,
  contentInput,
  loadData,
  setShowForm,
}: UseJournalUpdateEntryActionParams) => {
  return useCallback(() => {
    return createUpdateJournalEntryHandler({
      entryId,
      titleInput,
      contentInput,
      reloadData: loadData,
      closeForm: () => setShowForm(false),
    })();
  }, [entryId, titleInput, contentInput, loadData, setShowForm]);
};
