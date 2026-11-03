import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";
import {
  createCancelJournalFormHandler,
  createOpenEditJournalFormAction,
  createOpenJournalFormAction,
} from "./journalPageFormActions";

type UseJournalPageFormActionsArgs = {
  setTitleInput: Dispatch<SetStateAction<string>>;
  setContentInput: Dispatch<SetStateAction<string>>;
  setDateInput: Dispatch<SetStateAction<string | null>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
};

export const useJournalPageFormActions = ({
  setTitleInput,
  setContentInput,
  setDateInput,
  setShowForm,
  setEditingEntry,
}: UseJournalPageFormActionsArgs) => {
  const setters = {
    setTitleInput,
    setContentInput,
    setDateInput,
    setShowForm,
    setEditingEntry,
  };

  return {
    handleCancelForm: createCancelJournalFormHandler(setters),
    openForm: createOpenJournalFormAction(setters),
    openEditForm: createOpenEditJournalFormAction(setters),
  };
};
