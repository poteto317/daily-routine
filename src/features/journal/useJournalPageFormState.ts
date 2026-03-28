import type { JournalViewState } from "./journalViewStateActions";
import { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import { useJournalPageFormActions } from "./useJournalPageFormActions";
import { useJournalPageInputState } from "./useJournalPageInputState";
import { createJournalPageFormStateResult } from "./journalPageFormStateResult";

type JournalFormInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput" | "showForm"
>;

export const useJournalPageFormState = (
  initialState: JournalFormInitialState,
) => {
  const inputState = useJournalPageInputState(initialState);
  const visibilityState = useJournalPageFormVisibilityState(initialState);
  const { handleCancelForm, openForm } = useJournalPageFormActions({
    setTitleInput: inputState.setTitleInput,
    setContentInput: inputState.setContentInput,
    setShowForm: visibilityState.setShowForm,
  });

  return createJournalPageFormStateResult({
    inputState,
    visibilityState,
    handleCancelForm,
    openForm,
  });
};
