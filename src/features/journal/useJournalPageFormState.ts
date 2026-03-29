import { useState } from "react";
import type { JournalEntry } from "@/types/routine";
import type { JournalViewState } from "./journalViewStateActions";
import { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import { useJournalPageFormActions } from "./useJournalPageFormActions";
import { useJournalPageInputState } from "./useJournalPageInputState";
import { createJournalPageFormStateResult } from "./journalPageFormStateResult";

type JournalFormInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput" | "showForm"
>;

export const useJournalPageFormState = (
  initialState: JournalFormInitialState,
) => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const inputState = useJournalPageInputState(initialState);
  const visibilityState = useJournalPageFormVisibilityState(initialState);
  const { handleCancelForm, openForm, openEditForm } =
    useJournalPageFormActions({
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setShowForm: visibilityState.setShowForm,
      setEditingEntry,
    });

  return createJournalPageFormStateResult({
    inputState,
    visibilityState,
    editingEntry,
    setEditingEntry,
    handleCancelForm,
    openForm,
    openEditForm,
  });
};
