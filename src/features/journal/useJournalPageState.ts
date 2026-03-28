import { getTodayDateString } from "./utils/journalDate";
import { createJournalPageActionBindings } from "./journalPageActionBindings";
import { createJournalPageStateResult } from "./journalPageStateResult";
import { useJournalPageActions } from "./useJournalPageActions";
import { useJournalPageDataState } from "./useJournalPageDataState";
import { useJournalPageFormState } from "./useJournalPageFormState";

export const useJournalPageState = () => {
  const today = getTodayDateString();
  const {
    initialState,
    recentEntries,
    setRecentEntries,
    setTodayEntry,
    todayEntry,
  } = useJournalPageDataState();
  const {
    contentInput,
    showForm,
    titleInput,
    handleCancelForm,
    openForm,
    setContentInput,
    setShowForm,
    setTitleInput,
  } = useJournalPageFormState(initialState);

  const { handleDeleteEntry, handleSaveEntry } = useJournalPageActions(
    createJournalPageActionBindings({
      titleInput,
      contentInput,
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setRecentEntries,
      setShowForm,
    }),
  );

  return createJournalPageStateResult({
    contentInput,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleDeleteEntry,
    handleSaveEntry,
    openForm,
    setContentInput,
    setTitleInput,
  });
};
