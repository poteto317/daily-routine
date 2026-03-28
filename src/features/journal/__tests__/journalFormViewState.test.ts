jest.mock("../journalPageDataActions", () => ({
  resetJournalFormInputs: jest.fn(),
}));

import { resetJournalFormInputs } from "../journalPageDataActions";
import {
  createCanceledJournalFormState,
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
});
