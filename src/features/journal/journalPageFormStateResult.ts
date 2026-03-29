import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import type { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import type { useJournalPageInputState } from "./useJournalPageInputState";

type JournalPageInputState = ReturnType<typeof useJournalPageInputState>;
type JournalPageFormVisibilityState = ReturnType<
  typeof useJournalPageFormVisibilityState
>;

type CreateJournalPageFormStateResultArgs = {
  inputState: JournalPageInputState;
  visibilityState: JournalPageFormVisibilityState;
  editingEntry: JournalEntry | null;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
  handleCancelForm: () => void;
  openForm: () => void;
  openEditForm: (entry: JournalEntry) => void;
};

export const createJournalPageFormStateResult = ({
  inputState,
  visibilityState,
  editingEntry,
  setEditingEntry,
  handleCancelForm,
  openForm,
  openEditForm,
}: CreateJournalPageFormStateResultArgs) => {
  return {
    contentInput: inputState.contentInput,
    showForm: visibilityState.showForm,
    titleInput: inputState.titleInput,
    editingEntry,
    setEditingEntry,
    handleCancelForm,
    openForm,
    openEditForm,
    setContentInput: inputState.setContentInput,
    setShowForm: visibilityState.setShowForm,
    setTitleInput: inputState.setTitleInput,
  };
};
