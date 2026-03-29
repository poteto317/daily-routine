import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "./journalViewStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export const createCancelJournalFormHandler = (params: {
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setEditingEntry: SetValue<JournalEntry | null>;
}) => {
  const { setTitleInput, setContentInput, setShowForm, setEditingEntry } =
    params;

  return () => {
    const resetInputs = createCanceledJournalFormState();
    setTitleInput(resetInputs.titleInput);
    setContentInput(resetInputs.contentInput);
    setShowForm(resetInputs.showForm);
    setEditingEntry(null);
  };
};

export const createOpenJournalFormAction = (params: {
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setEditingEntry: SetValue<JournalEntry | null>;
}) => {
  const { setTitleInput, setContentInput, setShowForm, setEditingEntry } =
    params;

  return () => {
    const resetState = createCanceledJournalFormState();
    setTitleInput(resetState.titleInput);
    setContentInput(resetState.contentInput);
    setEditingEntry(null);
    setShowForm(createOpenedJournalFormState().showForm);
  };
};

export const createOpenEditJournalFormAction = (params: {
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setEditingEntry: SetValue<JournalEntry | null>;
}) => {
  const { setTitleInput, setContentInput, setShowForm, setEditingEntry } =
    params;

  return (entry: JournalEntry) => {
    const state = createEditingJournalFormState(entry);
    setTitleInput(state.titleInput);
    setContentInput(state.contentInput);
    setEditingEntry(state.editingEntry);
    setShowForm(state.showForm);
  };
};
