import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "./journalViewStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type JournalFormSetters = {
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setShowForm: SetValue<boolean>;
  setEditingEntry: SetValue<JournalEntry | null>;
};

export const createCancelJournalFormHandler = (params: JournalFormSetters) => {
  const {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  } = params;

  return () => {
    const resetInputs = createCanceledJournalFormState();
    setTitleInput(resetInputs.titleInput);
    setContentInput(resetInputs.contentInput);
    setDateInput(resetInputs.dateInput);
    setShowForm(resetInputs.showForm);
    setEditingEntry(null);
  };
};

export const createOpenJournalFormAction = (params: JournalFormSetters) => {
  const {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  } = params;

  return () => {
    const resetState = createCanceledJournalFormState();
    setTitleInput(resetState.titleInput);
    setContentInput(resetState.contentInput);
    setDateInput(resetState.dateInput);
    setEditingEntry(null);
    setShowForm(createOpenedJournalFormState().showForm);
  };
};

export const createOpenEditJournalFormAction = (params: JournalFormSetters) => {
  const {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  } = params;

  return (entry: JournalEntry) => {
    const state = createEditingJournalFormState(entry);
    setTitleInput(state.titleInput);
    setContentInput(state.contentInput);
    setDateInput(state.dateInput);
    setEditingEntry(state.editingEntry);
    setShowForm(state.showForm);
  };
};
