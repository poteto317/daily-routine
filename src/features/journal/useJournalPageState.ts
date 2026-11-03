import { getTodayDateString } from "./utils/journalDate";
import { createJournalPageActionBindings } from "./journalPageActionBindings";
import { createJournalPageStateResult } from "./journalPageStateResult";
import { useJournalPageActions } from "./useJournalPageActions";
import { useJournalPageDataState } from "./useJournalPageDataState";
import { useJournalPageFormState } from "./useJournalPageFormState";

export const useJournalPageState = () => {
  // 描画のたびに取り直す（開いたまま日をまたいでも、入力のたびに max と見出しが追いつく）
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
    dateInput,
    editingEntry,
    openEditForm,
    setEditingEntry,
    showForm,
    titleInput,
    handleCancelForm,
    handleContentChange,
    handleDateChange,
    handleTitleChange,
    openForm,
    setContentInput,
    setDateInput,
    setShowForm,
    setTitleInput,
  } = useJournalPageFormState(initialState);

  const { handleDeleteEntry, handleSaveEntry, handleUpdateEntry } =
    useJournalPageActions(
      createJournalPageActionBindings({
        titleInput,
        contentInput,
        dateInput,
        editingEntry,
        handleCancelForm,
        setTodayEntry,
        setTitleInput,
        setContentInput,
        setDateInput,
        setRecentEntries,
        setShowForm,
      }),
    );

  return createJournalPageStateResult({
    contentInput,
    dateInput,
    editingEntry,
    openEditForm,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleContentChange,
    handleDateChange,
    handleDeleteEntry,
    handleSaveEntry,
    handleTitleChange,
    handleUpdateEntry,
    openForm,
    setEditingEntry,
  });
};
