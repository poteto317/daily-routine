import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import { createJournalPageActionsResult } from "./journalPageActionsResult";
import { useJournalPageMutationActions } from "./useJournalPageMutationActions";
import { useJournalPageReloadAction } from "./useJournalPageReloadAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseJournalPageActionsParams = {
  titleInput: string;
  contentInput: string;
  editingEntry: JournalEntry | null;
  handleCancelForm: () => void;
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setRecentEntries: SetValue<JournalEntry[]>;
  setShowForm: SetValue<boolean>;
};

export const useJournalPageActions = ({
  titleInput,
  contentInput,
  editingEntry,
  handleCancelForm,
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setRecentEntries,
  setShowForm,
}: UseJournalPageActionsParams) => {
  const { loadData } = useJournalPageReloadAction({
    setTodayEntry,
    setTitleInput,
    setContentInput,
    setRecentEntries,
  });
  const { handleDeleteEntry, handleSaveEntry, handleUpdateEntry } =
    useJournalPageMutationActions({
      titleInput,
      contentInput,
      editingEntry,
      setShowForm,
      closeForm: handleCancelForm,
      loadData,
    });

  return createJournalPageActionsResult({
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
    loadData,
  });
};
