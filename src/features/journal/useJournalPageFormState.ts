import { useState } from "react";
import type { JournalEntry } from "@/types/routine";
import type { JournalViewState } from "./journalViewStateActions";
import { getTodayDateString } from "./utils/journalDate";
import { createJournalInputChangeHandlers } from "./journalInputChangeHandlers";
import { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import { useJournalPageFormActions } from "./useJournalPageFormActions";
import { useJournalPageInputState } from "./useJournalPageInputState";
import { createJournalPageFormStateResult } from "./journalPageFormStateResult";

type JournalFormInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput" | "dateInput" | "showForm"
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
      setDateInput: inputState.setDateInput,
      setShowForm: visibilityState.setShowForm,
      setEditingEntry,
    });
  // 入力 state と editingEntry の両方を知るこの層で、UI 用ハンドラを作る
  const { handleTitleChange, handleContentChange, handleDateChange } =
    createJournalInputChangeHandlers({
      editingEntry,
      getToday: getTodayDateString,
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
    });

  return createJournalPageFormStateResult({
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
  });
};
