import { renderHook } from "@testing-library/react";

jest.mock("../journalPageActionBindings", () => ({
  createJournalPageActionBindings: jest.fn(),
}));

jest.mock("../journalPageStateResult", () => ({
  createJournalPageStateResult: jest.fn(),
}));

jest.mock("../useJournalPageActions", () => ({
  useJournalPageActions: jest.fn(),
}));

jest.mock("../useJournalPageDataState", () => ({
  useJournalPageDataState: jest.fn(),
}));

jest.mock("../useJournalPageFormState", () => ({
  useJournalPageFormState: jest.fn(),
}));

jest.mock("../utils/journalDate", () => ({
  getTodayDateString: jest.fn(() => "2024-01-12"),
}));

import { createJournalPageActionBindings } from "../journalPageActionBindings";
import { createJournalPageStateResult } from "../journalPageStateResult";
import { getTodayDateString } from "../utils/journalDate";
import { useJournalPageActions } from "../useJournalPageActions";
import { useJournalPageDataState } from "../useJournalPageDataState";
import { useJournalPageFormState } from "../useJournalPageFormState";
import { useJournalPageState } from "../useJournalPageState";

describe("useJournalPageState", () => {
  const formState = {
    contentInput: "",
    dateInput: "2024-01-10",
    showForm: false,
    titleInput: "",
    editingEntry: null,
    openEditForm: jest.fn(),
    setEditingEntry: jest.fn(),
    handleCancelForm: jest.fn(),
    handleTitleChange: jest.fn(),
    handleContentChange: jest.fn(),
    handleDateChange: jest.fn(),
    openForm: jest.fn(),
    setContentInput: jest.fn(),
    setDateInput: jest.fn(),
    setShowForm: jest.fn(),
    setTitleInput: jest.fn(),
  };
  const dataState = {
    initialState: {
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    },
    recentEntries: [],
    setRecentEntries: jest.fn(),
    setTodayEntry: jest.fn(),
    todayEntry: null,
  };
  const actions = {
    handleDeleteEntry: jest.fn(),
    handleSaveEntry: jest.fn(),
    handleUpdateEntry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useJournalPageDataState as jest.Mock).mockReturnValue(dataState);
    (useJournalPageFormState as jest.Mock).mockReturnValue(formState);
    (createJournalPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useJournalPageActions as jest.Mock).mockReturnValue(actions);
    (createJournalPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("today/data/form/actions/result を compose する", () => {
    const { result } = renderHook(() => useJournalPageState());

    expect(getTodayDateString).toHaveBeenCalled();
    expect(useJournalPageFormState).toHaveBeenCalledWith(
      dataState.initialState,
    );
    expect(createJournalPageActionBindings).toHaveBeenCalledWith({
      titleInput: "",
      contentInput: "",
      dateInput: "2024-01-10",
      editingEntry: null,
      handleCancelForm: formState.handleCancelForm,
      setTodayEntry: dataState.setTodayEntry,
      setTitleInput: formState.setTitleInput,
      setContentInput: formState.setContentInput,
      setDateInput: formState.setDateInput,
      setRecentEntries: dataState.setRecentEntries,
      setShowForm: formState.setShowForm,
    });
    expect(useJournalPageActions).toHaveBeenCalledWith({ bound: true });
    expect(createJournalPageStateResult).toHaveBeenCalledWith({
      contentInput: "",
      dateInput: "2024-01-10",
      editingEntry: null,
      openEditForm: formState.openEditForm,
      recentEntries: [],
      showForm: false,
      titleInput: "",
      today: "2024-01-12",
      todayEntry: null,
      handleCancelForm: formState.handleCancelForm,
      handleContentChange: formState.handleContentChange,
      handleDateChange: formState.handleDateChange,
      handleDeleteEntry: actions.handleDeleteEntry,
      handleSaveEntry: actions.handleSaveEntry,
      handleTitleChange: formState.handleTitleChange,
      handleUpdateEntry: actions.handleUpdateEntry,
      openForm: formState.openForm,
      setEditingEntry: formState.setEditingEntry,
    });
    expect(result.current).toEqual({ composed: true });
  });
});
