import { createJournalPageFormStateResult } from "../journalPageFormStateResult";

describe("createJournalPageFormStateResult", () => {
  it("input と visibility と form actions と UI 用ハンドラの公開 shape をまとめて返す", () => {
    const inputState = {
      titleInput: "Diary",
      contentInput: "Today was good",
      dateInput: "2026-03-10",
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
    };
    const visibilityState = {
      showForm: true,
      setShowForm: jest.fn(),
    };
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const openEditForm = jest.fn();
    const setEditingEntry = jest.fn();
    const handleTitleChange = jest.fn();
    const handleContentChange = jest.fn();
    const handleDateChange = jest.fn();
    const editingEntry = null;

    const result = createJournalPageFormStateResult({
      inputState,
      visibilityState,
      editingEntry,
      setEditingEntry,
      handleCancelForm,
      openForm,
      openEditForm,
      handleTitleChange,
      handleContentChange,
      handleDateChange,
    });

    expect(result).toEqual({
      contentInput: "Today was good",
      dateInput: "2026-03-10",
      showForm: true,
      titleInput: "Diary",
      editingEntry,
      setEditingEntry,
      handleCancelForm,
      openForm,
      openEditForm,
      handleTitleChange,
      handleContentChange,
      handleDateChange,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
      setShowForm: visibilityState.setShowForm,
      setTitleInput: inputState.setTitleInput,
    });
  });
});
