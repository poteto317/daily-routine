import type { Dispatch, SetStateAction } from "react";
import { createJournalPageMutationActionsResult } from "./journalPageMutationActionsResult";
import { useJournalDeleteEntryAction } from "./useJournalDeleteEntryAction";
import { useJournalSaveEntryAction } from "./useJournalSaveEntryAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageMutationActionsParams = {
  titleInput: string;
  contentInput: string;
  setShowForm: SetValue<boolean>;
  loadData: () => void;
};

export const useJournalPageMutationActions = ({
  titleInput,
  contentInput,
  setShowForm,
  loadData,
}: UseJournalPageMutationActionsParams) => {
  const handleDeleteEntry = useJournalDeleteEntryAction({
    loadData,
  });
  const handleSaveEntry = useJournalSaveEntryAction({
    titleInput,
    contentInput,
    loadData,
    setShowForm,
  });

  return createJournalPageMutationActionsResult({
    handleDeleteEntry,
    handleSaveEntry,
  });
};
