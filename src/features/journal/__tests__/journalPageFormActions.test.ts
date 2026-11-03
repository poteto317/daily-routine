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

const createSetters = () => ({
  setTitleInput: jest.fn(),
  setContentInput: jest.fn(),
  setDateInput: jest.fn(),
  setShowForm: jest.fn(),
  setEditingEntry: jest.fn(),
});

describe("journalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cancel handler がフォーム入力を空に戻し、日付を null に戻し、editingEntry をクリアする", () => {
    const setters = createSetters();
    (createCanceledJournalFormState as jest.Mock).mockReturnValue({
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    });

    createCancelJournalFormHandler(setters)();

    expect(createCanceledJournalFormState).toHaveBeenCalledWith();
    expect(setters.setTitleInput).toHaveBeenCalledWith("");
    expect(setters.setContentInput).toHaveBeenCalledWith("");
    expect(setters.setDateInput).toHaveBeenCalledWith(null);
    expect(setters.setShowForm).toHaveBeenCalledWith(false);
    expect(setters.setEditingEntry).toHaveBeenCalledWith(null);
  });

  it("open action がフォームを開き、入力・日付・editingEntry をリセットする", () => {
    const setters = createSetters();
    (createCanceledJournalFormState as jest.Mock).mockReturnValue({
      titleInput: "",
      contentInput: "",
      dateInput: null,
      showForm: false,
    });
    (createOpenedJournalFormState as jest.Mock).mockReturnValue({
      showForm: true,
    });

    createOpenJournalFormAction(setters)();

    expect(createCanceledJournalFormState).toHaveBeenCalled();
    expect(createOpenedJournalFormState).toHaveBeenCalled();
    expect(setters.setTitleInput).toHaveBeenCalledWith("");
    expect(setters.setContentInput).toHaveBeenCalledWith("");
    expect(setters.setDateInput).toHaveBeenCalledWith(null);
    expect(setters.setEditingEntry).toHaveBeenCalledWith(null);
    expect(setters.setShowForm).toHaveBeenCalledWith(true);
  });

  it("openEdit action がエントリの内容と日付でフォームを初期化する", () => {
    const setters = createSetters();
    const entry = {
      id: "j1",
      date: "2026-01-01",
      title: "My Title",
      content: "My Content",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    (createEditingJournalFormState as jest.Mock).mockReturnValue({
      titleInput: "My Title",
      contentInput: "My Content",
      dateInput: "2026-01-01",
      editingEntry: entry,
      showForm: true,
    });

    createOpenEditJournalFormAction(setters)(entry);

    expect(createEditingJournalFormState).toHaveBeenCalledWith(entry);
    expect(setters.setTitleInput).toHaveBeenCalledWith("My Title");
    expect(setters.setContentInput).toHaveBeenCalledWith("My Content");
    expect(setters.setDateInput).toHaveBeenCalledWith("2026-01-01");
    expect(setters.setEditingEntry).toHaveBeenCalledWith(entry);
    expect(setters.setShowForm).toHaveBeenCalledWith(true);
  });
});
