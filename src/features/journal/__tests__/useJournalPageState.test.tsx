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
  beforeEach(() => {
    jest.clearAllMocks();
    (useJournalPageDataState as jest.Mock).mockReturnValue({
      initialState: {
        titleInput: "",
        contentInput: "",
        showForm: false,
      },
      recentEntries: [],
      setRecentEntries: jest.fn(),
      setTodayEntry: jest.fn(),
      todayEntry: null,
    });
    (useJournalPageFormState as jest.Mock).mockReturnValue({
      contentInput: "",
      showForm: false,
      titleInput: "",
      editingEntry: null,
      openEditForm: jest.fn(),
      setEditingEntry: jest.fn(),
      handleCancelForm: jest.fn(),
      openForm: jest.fn(),
      setContentInput: jest.fn(),
      setShowForm: jest.fn(),
      setTitleInput: jest.fn(),
    });
    (createJournalPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useJournalPageActions as jest.Mock).mockReturnValue({
      handleDeleteEntry: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleUpdateEntry: jest.fn(),
    });
    (createJournalPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("today/data/form/actions/result を compose する", () => {
    const { result } = renderHook(() => useJournalPageState());

    expect(getTodayDateString).toHaveBeenCalled();
    expect(useJournalPageFormState).toHaveBeenCalledWith(
      expect.objectContaining({
        titleInput: "",
        contentInput: "",
        showForm: false,
      }),
    );
    expect(createJournalPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        titleInput: "",
        contentInput: "",
        handleCancelForm: expect.any(Function),
      }),
    );
    expect(useJournalPageActions).toHaveBeenCalledWith({ bound: true });
    expect(createJournalPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        todayEntry: null,
        recentEntries: [],
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
