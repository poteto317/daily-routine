import type { useJournalPageFormVisibilityState } from "./useJournalPageFormVisibilityState";
import type { useJournalPageInputState } from "./useJournalPageInputState";

type JournalPageInputState = ReturnType<typeof useJournalPageInputState>;
type JournalPageFormVisibilityState = ReturnType<
  typeof useJournalPageFormVisibilityState
>;

type CreateJournalPageFormStateResultArgs = {
  inputState: JournalPageInputState;
  visibilityState: JournalPageFormVisibilityState;
  handleCancelForm: () => void;
  openForm: () => void;
};

export const createJournalPageFormStateResult = ({
  inputState,
  visibilityState,
  handleCancelForm,
  openForm,
}: CreateJournalPageFormStateResultArgs) => {
  return {
    contentInput: inputState.contentInput,
    showForm: visibilityState.showForm,
    titleInput: inputState.titleInput,
    handleCancelForm,
    openForm,
    setContentInput: inputState.setContentInput,
    setShowForm: visibilityState.setShowForm,
    setTitleInput: inputState.setTitleInput,
  };
};
