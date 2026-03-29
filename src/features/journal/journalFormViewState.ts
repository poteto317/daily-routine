import type { JournalEntry } from "@/types/routine";
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

export const createEditingJournalFormState = (entry: JournalEntry) => {
  return {
    titleInput: entry.title,
    contentInput: entry.content,
    editingEntry: entry,
    showForm: true,
  };
};
