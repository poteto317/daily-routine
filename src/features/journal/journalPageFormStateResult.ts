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
  handleTitleChange: (value: string) => void;
  handleContentChange: (value: string) => void;
  handleDateChange: (value: string) => void;
};

/**
 * フォームの state の公開 shape。UI には handle*Change を渡し、
 * 素のセッター（set*Input）は再読み込み・リセットの組み立てにだけ渡す。
 */
export const createJournalPageFormStateResult = ({
  inputState,
  visibilityState,
  editingEntry,
  setEditingEntry,
  handleCancelForm,
  openForm,
  openEditForm,
  handleTitleChange,
  handleContentChange,
  handleDateChange,
}: CreateJournalPageFormStateResultArgs) => {
  return {
    contentInput: inputState.contentInput,
    dateInput: inputState.dateInput,
    showForm: visibilityState.showForm,
    titleInput: inputState.titleInput,
    editingEntry,
    setEditingEntry,
    handleCancelForm,
    openForm,
    openEditForm,
    handleTitleChange,
    handleContentChange,
    handleDateChange,
    setContentInput: inputState.setContentInput,
    setDateInput: inputState.setDateInput,
    setShowForm: visibilityState.setShowForm,
    setTitleInput: inputState.setTitleInput,
  };
};
