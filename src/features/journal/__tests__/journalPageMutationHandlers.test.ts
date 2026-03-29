import journalTexts from "../locales/ja.json";
import {
  createDeleteJournalEntryHandler,
  createSaveJournalEntryHandler,
  createUpdateJournalEntryHandler,
} from "../journalPageMutationHandlers";
import { confirmDeleteEntry } from "../helpers";
import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
  updateJournalEntryAndReload,
} from "../journalMutationActions";
import {
  deleteJournalEntry,
  saveJournalEntry,
  updateJournalEntry,
} from "../storage";

jest.mock("../helpers", () => ({
  confirmDeleteEntry: jest.fn(),
}));

jest.mock("../journalMutationActions", () => ({
  deleteJournalEntryAndReload: jest.fn(),
  saveJournalEntryAndReload: jest.fn(),
  updateJournalEntryAndReload: jest.fn(),
}));

jest.mock("../storage", () => ({
  deleteJournalEntry: jest.fn(),
  saveJournalEntry: jest.fn(),
  updateJournalEntry: jest.fn(),
}));

describe("journalPageMutationHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("update handler が既定文言と更新処理を組み立てる", () => {
    const reloadData = jest.fn();
    const closeForm = jest.fn();

    (updateJournalEntryAndReload as jest.Mock).mockReturnValue(true);

    const result = createUpdateJournalEntryHandler({
      entryId: "entry-1",
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      reloadData,
      closeForm,
    })();

    expect(result).toBe(true);
    expect(updateJournalEntryAndReload).toHaveBeenCalledWith({
      entryId: "entry-1",
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      updateEntry: updateJournalEntry,
      reloadData,
      closeForm,
    });
  });
});
