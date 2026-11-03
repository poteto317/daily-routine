import { renderHook } from "@testing-library/react";

jest.mock("../journalPageFormStateResult", () => ({
  createJournalPageFormStateResult: jest.fn(),
}));

jest.mock("../useJournalPageInputState", () => ({
  useJournalPageInputState: jest.fn(),
}));

jest.mock("../useJournalPageFormVisibilityState", () => ({
  useJournalPageFormVisibilityState: jest.fn(),
}));

jest.mock("../useJournalPageFormActions", () => ({
  useJournalPageFormActions: jest.fn(),
}));

import { createJournalPageFormStateResult } from "../journalPageFormStateResult";
import { useJournalPageFormActions } from "../useJournalPageFormActions";
import { useJournalPageInputState } from "../useJournalPageInputState";
import { useJournalPageFormVisibilityState } from "../useJournalPageFormVisibilityState";
import { useJournalPageFormState } from "../useJournalPageFormState";

describe("useJournalPageFormState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("input/visibility/action hook と UI 用ハンドラを compose する", () => {
    const inputState = {
      titleInput: "",
      contentInput: "",
      dateInput: null,
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
    };
    const visibilityState = {
      showForm: false,
      setShowForm: jest.fn(),
    };
    const actions = {
      handleCancelForm: jest.fn(),
      openForm: jest.fn(),
      openEditForm: jest.fn(),
    };
    (useJournalPageInputState as jest.Mock).mockReturnValue(inputState);
    (useJournalPageFormVisibilityState as jest.Mock).mockReturnValue(
      visibilityState,
    );
    (useJournalPageFormActions as jest.Mock).mockReturnValue(actions);
    const resultState = { composed: true };
    (createJournalPageFormStateResult as jest.Mock).mockReturnValue(
      resultState,
    );
    const initialState = {
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    };

    const { result } = renderHook(() => useJournalPageFormState(initialState));

    expect(useJournalPageInputState).toHaveBeenCalledWith(initialState);
    expect(useJournalPageFormVisibilityState).toHaveBeenCalledWith(
      initialState,
    );
    expect(useJournalPageFormActions).toHaveBeenCalledWith({
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setDateInput: inputState.setDateInput,
      setShowForm: visibilityState.setShowForm,
      setEditingEntry: expect.any(Function),
    });
    expect(createJournalPageFormStateResult).toHaveBeenCalledWith({
      inputState,
      visibilityState,
      editingEntry: null,
      setEditingEntry: expect.any(Function),
      handleCancelForm: actions.handleCancelForm,
      openForm: actions.openForm,
      openEditForm: actions.openEditForm,
      handleTitleChange: expect.any(Function),
      handleContentChange: expect.any(Function),
      handleDateChange: expect.any(Function),
    });
    expect(result.current).toBe(resultState);

    // UI 用ハンドラが入力 state のセッターにつながっている
    const args = (createJournalPageFormStateResult as jest.Mock).mock
      .calls[0][0] as {
      handleTitleChange: (value: string) => void;
      handleContentChange: (value: string) => void;
      handleDateChange: (value: string) => void;
    };
    args.handleTitleChange("タイトル");
    args.handleContentChange("本文");
    args.handleDateChange("2026-03-01");
    expect(inputState.setTitleInput).toHaveBeenCalledWith("タイトル");
    expect(inputState.setContentInput).toHaveBeenCalledWith("本文");
    expect(inputState.setDateInput).toHaveBeenCalledWith("2026-03-01");
  });
});
