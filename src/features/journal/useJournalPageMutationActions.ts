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
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  setShowForm: SetValue<boolean>;
  closeForm: () => void;
  loadData: () => void;
};

export const useJournalPageMutationActions = ({
  titleInput,
  contentInput,
  dateInput,
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
    dateInput,
    loadData,
    setShowForm,
  });
  const updateEntryBase = useJournalUpdateEntryAction({
    entryId: editingEntry?.id ?? "",
    originalDate: editingEntry?.date ?? "",
    dateInput,
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
