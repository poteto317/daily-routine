import {
  createCancelJournalFormHandler,
  createOpenJournalFormAction,
} from "../journalPageFormActions";
import {
  createCanceledJournalFormState,
  createOpenedJournalFormState,
} from "../journalViewStateActions";

jest.mock("../journalViewStateActions", () => ({
  createCanceledJournalFormState: jest.fn(),
  createOpenedJournalFormState: jest.fn(),
}));

describe("journalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cancel handler がフォーム入力を空に戻す", () => {
    const canceledState = {
      titleInput: "",
      contentInput: "",
      showForm: false,
    };
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setShowForm = jest.fn();

    (createCanceledJournalFormState as jest.Mock).mockReturnValue(
      canceledState,
    );

    createCancelJournalFormHandler({
      setTitleInput,
      setContentInput,
      setShowForm,
    })();

    expect(createCanceledJournalFormState).toHaveBeenCalledWith();
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setContentInput).toHaveBeenCalledWith("");
    expect(setShowForm).toHaveBeenCalledWith(false);
  });

  it("open action が showForm を開く", () => {
    const setShowForm = jest.fn();

    (createOpenedJournalFormState as jest.Mock).mockReturnValue({
      showForm: true,
    });

    createOpenJournalFormAction({ setShowForm })();

    expect(createOpenedJournalFormState).toHaveBeenCalled();
    expect(setShowForm).toHaveBeenCalledWith(true);
  });
});
