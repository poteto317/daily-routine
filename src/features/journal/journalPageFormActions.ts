import type { Dispatch, SetStateAction } from "react";
import {
  createCanceledJournalFormState,
  createOpenedJournalFormState,
} from "./journalViewStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export const createCancelJournalFormHandler = (params: {
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
}) => {
  const { setTitleInput, setContentInput, setShowForm } = params;

  return () => {
    const resetInputs = createCanceledJournalFormState();
    setTitleInput(resetInputs.titleInput);
    setContentInput(resetInputs.contentInput);
    setShowForm(resetInputs.showForm);
  };
};

export const createOpenJournalFormAction = (params: {
  setShowForm: SetValue<boolean>;
}) => {
  const { setShowForm } = params;

  return () => {
    setShowForm(createOpenedJournalFormState().showForm);
  };
};
