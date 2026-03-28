import journalTexts from "../locales/ja.json";
import {
  createCancelJournalFormHandler,
  createDeleteJournalEntryHandler,
  createLoadJournalDataAction,
  createOpenJournalFormAction,
  createSaveJournalEntryHandler,
} from "../journalPageStateActions";
import { confirmDeleteEntry } from "../helpers";
import {
  createCanceledJournalFormState,
  createOpenedJournalFormState,
  createReloadedJournalViewState,
} from "../journalViewStateActions";
import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
} from "../journalMutationActions";
import {
  deleteJournalEntry,
  getJournalHistory,
  getTodayJournalEntry,
  saveJournalEntry,
} from "../storage";

jest.mock("../helpers", () => ({
  confirmDeleteEntry: jest.fn(),
}));

jest.mock("../journalViewStateActions", () => ({
  createCanceledJournalFormState: jest.fn(),
  createOpenedJournalFormState: jest.fn(),
  createReloadedJournalViewState: jest.fn(),
}));

jest.mock("../journalMutationActions", () => ({
  deleteJournalEntryAndReload: jest.fn(),
  saveJournalEntryAndReload: jest.fn(),
}));

jest.mock("../storage", () => ({
  deleteJournalEntry: jest.fn(),
  getJournalHistory: jest.fn(),
  getTodayJournalEntry: jest.fn(),
  saveJournalEntry: jest.fn(),
}));

describe("journalPageStateActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("load action が storage と view state をつないで setter に反映する", () => {
    const todayEntry = {
      id: "today",
      date: "2024-01-12",
      title: "今日",
      content: "本文",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };
    const history = { [todayEntry.date]: [todayEntry] };
    const viewState = {
      todayEntry,
      titleInput: "",
      contentInput: "",
      recentEntries: [todayEntry],
    };
    const setTodayEntry = jest.fn();
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setRecentEntries = jest.fn();

    (getTodayJournalEntry as jest.Mock).mockReturnValue(todayEntry);
    (getJournalHistory as jest.Mock).mockReturnValue(history);
    (createReloadedJournalViewState as jest.Mock).mockReturnValue(viewState);

    createLoadJournalDataAction({
      setTodayEntry,
      setTitleInput,
      setContentInput,
      setRecentEntries,
    })();

    expect(createReloadedJournalViewState).toHaveBeenCalledWith(
      todayEntry,
      history,
    );
    expect(setTodayEntry).toHaveBeenCalledWith(todayEntry);
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setContentInput).toHaveBeenCalledWith("");
    expect(setRecentEntries).toHaveBeenCalledWith([todayEntry]);
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

  it("delete handler が確認文言と再読込処理を組み立てる", () => {
    const reloadData = jest.fn();

    (confirmDeleteEntry as jest.Mock).mockReturnValue("delete?");
    (deleteJournalEntryAndReload as jest.Mock).mockReturnValue(true);

    const entry = {
      id: "entry-1",
      date: "2024-01-12",
      title: "title",
      content: "content",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };

    const result = createDeleteJournalEntryHandler({ reloadData })(entry);

    expect(result).toBe(true);
    expect(confirmDeleteEntry).toHaveBeenCalledWith("2024-01-12");
    expect(deleteJournalEntryAndReload).toHaveBeenCalledWith({
      entryId: "entry-1",
      confirmMessage: "delete?",
      deleteEntry: deleteJournalEntry,
      reloadData,
    });
  });

  it("save handler が既定文言と保存処理を組み立てる", () => {
    const reloadData = jest.fn();
    const closeForm = jest.fn();
    const getToday = jest.fn(() => "2024-01-12");

    (saveJournalEntryAndReload as jest.Mock).mockReturnValue(true);

    const result = createSaveJournalEntryHandler({
      getToday,
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      reloadData,
      closeForm,
    })();

    expect(result).toBe(true);
    expect(getToday).toHaveBeenCalledWith();
    expect(saveJournalEntryAndReload).toHaveBeenCalledWith({
      today: "2024-01-12",
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      saveEntry: saveJournalEntry,
      reloadData,
      closeForm,
    });
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
