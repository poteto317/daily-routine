import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { createJournalPageMutationActionsResult } from "./journalPageMutationActionsResult";
import { useJournalDeleteEntryAction } from "./useJournalDeleteEntryAction";
import { useJournalSaveEntryAction } from "./useJournalSaveEntryAction";
import { useJournalUpdateEntryAction } from "./useJournalUpdateEntryAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageMutationActionsParams = {
  titleInput: string;
  contentInput: string;
  editingEntry: JournalEntry | null;
  setShowForm: SetValue<boolean>;
  closeForm: () => void;
  loadData: () => void;
};

export const useJournalPageMutationActions = ({
  titleInput,
  contentInput,
  editingEntry,
  setShowForm,
  closeForm,
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
  const updateEntryBase = useJournalUpdateEntryAction({
    entryId: editingEntry?.id ?? "",
    titleInput,
    contentInput,
    loadData,
    closeForm,
  });
  const handleUpdateEntry = editingEntry ? updateEntryBase : () => {};

  return createJournalPageMutationActionsResult({
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
  });
};
