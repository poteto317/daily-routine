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
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
};

export const useJournalPageFormActions = ({
  setTitleInput,
  setContentInput,
  setShowForm,
  setEditingEntry,
}: UseJournalPageFormActionsArgs) => {
  return {
    handleCancelForm: createCancelJournalFormHandler({
      setTitleInput,
      setContentInput,
      setShowForm,
      setEditingEntry,
    }),
    openForm: createOpenJournalFormAction({
      setTitleInput,
      setContentInput,
      setShowForm,
      setEditingEntry,
    }),
    openEditForm: createOpenEditJournalFormAction({
      setTitleInput,
      setContentInput,
      setShowForm,
      setEditingEntry,
    }),
  };
};
