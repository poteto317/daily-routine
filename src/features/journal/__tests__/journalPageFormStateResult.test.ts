import { createJournalPageFormStateResult } from "../journalPageFormStateResult";

describe("createJournalPageFormStateResult", () => {
  it("input と visibility と form actions の公開 shape をまとめて返す", () => {
    const inputState = {
      titleInput: "Diary",
      contentInput: "Today was good",
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
    };
    const visibilityState = {
      showForm: true,
      setShowForm: jest.fn(),
    };
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();

    const result = createJournalPageFormStateResult({
      inputState,
      visibilityState,
      handleCancelForm,
      openForm,
    });

    expect(result).toEqual({
      contentInput: "Today was good",
      showForm: true,
      titleInput: "Diary",
      handleCancelForm,
      openForm,
      setContentInput: inputState.setContentInput,
      setShowForm: visibilityState.setShowForm,
      setTitleInput: inputState.setTitleInput,
    });
  });
});
