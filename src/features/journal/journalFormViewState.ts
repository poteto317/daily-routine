import { resetJournalFormInputs } from "./journalPageDataActions";

export const createCanceledJournalFormState = () => {
  return {
    ...resetJournalFormInputs(),
    showForm: false,
  };
};

export const createOpenedJournalFormState = () => {
  return {
    showForm: true,
  };
};
