import {
  createCancelJournalFormHandler,
  createOpenEditJournalFormAction,
  createOpenJournalFormAction,
} from "../journalPageFormActions";
import {
  createCanceledJournalFormState,
  createEditingJournalFormState,
  createOpenedJournalFormState,
} from "../journalViewStateActions";

jest.mock("../journalViewStateActions", () => ({
  createCanceledJournalFormState: jest.fn(),
  createEditingJournalFormState: jest.fn(),
  createOpenedJournalFormState: jest.fn(),
}));

describe("journalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cancel handler がフォーム入力を空に戻し editingEntry をクリアする", () => {
    const canceledState = {
      titleInput: "",
      contentInput: "",
      showForm: false,
    };
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setShowForm = jest.fn();
    const setEditingEntry = jest.fn();

    (createCanceledJournalFormState as jest.Mock).mockReturnValue(
      canceledState,
    );

    createCancelJournalFormHandler({
      setTitleInput,
      setContentInput,
      setShowForm,
      setEditingEntry,
    })();

    expect(createCanceledJournalFormState).toHaveBeenCalledWith();
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setContentInput).toHaveBeenCalledWith("");
    expect(setShowForm).toHaveBeenCalledWith(false);
    expect(setEditingEntry).toHaveBeenCalledWith(null);
  });

  it("open action がフォームを開き入力と editingEntry をリセットする", () => {
    const canceledState = {
      titleInput: "",
      contentInput: "",
      showForm: false,
    };
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setShowForm = jest.fn();
    const setEditingEntry = jest.fn();

    (createCanceledJournalFormState as jest.Mock).mockReturnValue(
      canceledState,
    );
    (createOpenedJournalFormState as jest.Mock).mockReturnValue({
      showForm: true,
    });

    createOpenJournalFormAction({
      setTitleInput,
      setContentInput,
      setShowForm,
      setEditingEntry,
    })();

    expect(createCanceledJournalFormState).toHaveBeenCalled();
    expect(createOpenedJournalFormState).toHaveBeenCalled();
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setContentInput).toHaveBeenCalledWith("");
    expect(setEditingEntry).toHaveBeenCalledWith(null);
    expect(setShowForm).toHaveBeenCalledWith(true);
  });

  it("openEdit action がエントリの内容でフォームを初期化する", () => {
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setShowForm = jest.fn();
    const setEditingEntry = jest.fn();
    const entry = {
      id: "j1",
      date: "2026-01-01",
      title: "My Title",
      content: "My Content",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const editingState = {
      titleInput: "My Title",
      contentInput: "My Content",
      editingEntry: entry,
      showForm: true,
    };

    (createEditingJournalFormState as jest.Mock).mockReturnValue(editingState);

    createOpenEditJournalFormAction({
      setTitleInput,
      setContentInput,
      setShowForm,
      setEditingEntry,
    })(entry);

    expect(createEditingJournalFormState).toHaveBeenCalledWith(entry);
    expect(setTitleInput).toHaveBeenCalledWith("My Title");
    expect(setContentInput).toHaveBeenCalledWith("My Content");
    expect(setEditingEntry).toHaveBeenCalledWith(entry);
    expect(setShowForm).toHaveBeenCalledWith(true);
  });
});
