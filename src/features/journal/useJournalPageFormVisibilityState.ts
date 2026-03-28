import { useState } from "react";
import type { JournalViewState } from "./journalViewStateActions";

type JournalPageFormVisibilityInitialState = Pick<JournalViewState, "showForm">;

export const useJournalPageFormVisibilityState = (
  initialState: JournalPageFormVisibilityInitialState,
) => {
  const [showForm, setShowForm] = useState(initialState.showForm);

  return {
    setShowForm,
    showForm,
  };
};
