import type { Dispatch, SetStateAction } from "react";
import {
  createCancelJournalFormHandler,
  createOpenJournalFormAction,
} from "./journalPageFormActions";

type UseJournalPageFormActionsArgs = {
  setTitleInput: Dispatch<SetStateAction<string>>;
  setContentInput: Dispatch<SetStateAction<string>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

export const useJournalPageFormActions = ({
  setTitleInput,
  setContentInput,
  setShowForm,
}: UseJournalPageFormActionsArgs) => {
  return {
    handleCancelForm: createCancelJournalFormHandler({
      setTitleInput,
      setContentInput,
      setShowForm,
    }),
    openForm: createOpenJournalFormAction({ setShowForm }),
  };
};
