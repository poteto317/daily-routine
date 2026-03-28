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

  it("input/visibility/action hook を compose する", () => {
    const inputState = {
      titleInput: "",
      contentInput: "",
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
    };
    const visibilityState = {
      showForm: false,
      setShowForm: jest.fn(),
    };
    const actions = {
      handleCancelForm: jest.fn(),
      openForm: jest.fn(),
    };
    (useJournalPageInputState as jest.Mock).mockReturnValue(inputState);
    (useJournalPageFormVisibilityState as jest.Mock).mockReturnValue(
      visibilityState,
    );
    (useJournalPageFormActions as jest.Mock).mockReturnValue(actions);
    const resultState = {
      contentInput: "",
      showForm: false,
      titleInput: "",
      handleCancelForm: actions.handleCancelForm,
      openForm: actions.openForm,
      setContentInput: inputState.setContentInput,
      setShowForm: visibilityState.setShowForm,
      setTitleInput: inputState.setTitleInput,
    };
    (createJournalPageFormStateResult as jest.Mock).mockReturnValue(
      resultState,
    );

    const { result } = renderHook(() =>
      useJournalPageFormState({
        titleInput: "",
        contentInput: "",
        showForm: false,
      }),
    );

    expect(useJournalPageInputState).toHaveBeenCalledWith({
      titleInput: "",
      contentInput: "",
      showForm: false,
    });
    expect(useJournalPageFormVisibilityState).toHaveBeenCalledWith({
      titleInput: "",
      contentInput: "",
      showForm: false,
    });
    expect(useJournalPageFormActions).toHaveBeenCalledWith({
      setTitleInput: inputState.setTitleInput,
      setContentInput: inputState.setContentInput,
      setShowForm: visibilityState.setShowForm,
    });
    expect(createJournalPageFormStateResult).toHaveBeenCalledWith({
      inputState,
      visibilityState,
      handleCancelForm: actions.handleCancelForm,
      openForm: actions.openForm,
    });
    expect(result.current).toBe(resultState);
  });
});
