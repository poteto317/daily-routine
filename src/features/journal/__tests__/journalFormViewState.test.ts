jest.mock("../journalPageDataActions", () => ({
  resetJournalFormInputs: jest.fn(),
}));

import { resetJournalFormInputs } from "../journalPageDataActions";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "../journalFormViewState";

describe("journalFormViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resetJournalFormInputs as jest.Mock).mockReturnValue({
      titleInput: "",
      contentInput: "",
    });
  });

  it("cancel 時の form state を生成する", () => {
    expect(createCanceledJournalFormState()).toEqual({
      titleInput: "",
      contentInput: "",
      showForm: false,
    });
    expect(resetJournalFormInputs).toHaveBeenCalledWith();
  });

  it("open 時の form state を生成する", () => {
    expect(createOpenedJournalFormState()).toEqual({
      showForm: true,
    });
  });

  it("editing 時の form state をエントリで初期化する", () => {
    const entry = {
      id: "j1",
      date: "2026-01-01",
      title: "My Title",
      content: "My Content",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(createEditingJournalFormState(entry)).toEqual({
      titleInput: "My Title",
      contentInput: "My Content",
      editingEntry: entry,
      showForm: true,
    });
  });
});
