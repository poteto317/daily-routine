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
      dateInput: null,
    });
  });

  it("cancel 時の form state を生成する（日付は未操作に戻す）", () => {
    expect(createCanceledJournalFormState()).toEqual({
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    });
    expect(resetJournalFormInputs).toHaveBeenCalledWith();
  });

  it("open 時の form state を生成する", () => {
    expect(createOpenedJournalFormState()).toEqual({
      showForm: true,
    });
  });

  it("editing 時の form state をエントリで初期化する（日付はエントリの日付）", () => {
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
      dateInput: "2026-01-01",
      editingEntry: entry,
      showForm: true,
    });
  });
});
