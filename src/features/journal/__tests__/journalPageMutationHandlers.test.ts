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

  const dateAlertMessages = {
    invalid: journalTexts.page.alertInvalidDate,
    future: journalTexts.page.alertFutureDate,
  };

  it("save handler は今日を 1 回だけ取り、未操作（null）なら今日を日付として保存処理を組み立てる", () => {
    const reloadData = jest.fn();
    const closeForm = jest.fn();
    const getToday = jest.fn(() => "2024-01-12");

    (saveJournalEntryAndReload as jest.Mock).mockReturnValue(true);

    const result = createSaveJournalEntryHandler({
      getToday,
      dateInput: null,
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      reloadData,
      closeForm,
    })();

    expect(result).toBe(true);
    expect(getToday).toHaveBeenCalledTimes(1);
    expect(saveJournalEntryAndReload).toHaveBeenCalledWith({
      today: "2024-01-12",
      date: "2024-01-12",
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      dateAlertMessages,
      saveEntry: saveJournalEntry,
      reloadData,
      closeForm,
    });
  });

  it("save handler は選んだ日付（固定済みの日付）を渡し、今日は未来の判定にだけ使う", () => {
    const getToday = jest.fn(() => "2024-01-12");

    createSaveJournalEntryHandler({
      getToday,
      dateInput: "2024-01-05",
      titleInput: "タイトル",
      contentInput: "本文",
      reloadData: jest.fn(),
      closeForm: jest.fn(),
    })();

    expect(saveJournalEntryAndReload).toHaveBeenCalledWith(
      expect.objectContaining({ today: "2024-01-12", date: "2024-01-05" }),
    );
  });

  it('save handler は空にした日付（""）を今日に置き換えない', () => {
    createSaveJournalEntryHandler({
      getToday: () => "2024-01-12",
      dateInput: "",
      titleInput: "タイトル",
      contentInput: "本文",
      reloadData: jest.fn(),
      closeForm: jest.fn(),
    })();

    expect(saveJournalEntryAndReload).toHaveBeenCalledWith(
      expect.objectContaining({ today: "2024-01-12", date: "" }),
    );
  });

  it("update handler は今日を 1 回だけ取り、編集前の日付と日付の入力を渡して更新処理を組み立てる", () => {
    const reloadData = jest.fn();
    const closeForm = jest.fn();
    const getToday = jest.fn(() => "2024-01-12");

    (updateJournalEntryAndReload as jest.Mock).mockReturnValue(true);

    const result = createUpdateJournalEntryHandler({
      entryId: "entry-1",
      originalDate: "2024-01-10",
      dateInput: "2024-01-05",
      getToday,
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      reloadData,
      closeForm,
    })();

    expect(result).toBe(true);
    expect(getToday).toHaveBeenCalledTimes(1);
    expect(updateJournalEntryAndReload).toHaveBeenCalledWith({
      entryId: "entry-1",
      originalDate: "2024-01-10",
      dateInput: "2024-01-05",
      today: "2024-01-12",
      titleInput: " タイトル ",
      contentInput: " 本文 ",
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      dateAlertMessages,
      updateEntry: updateJournalEntry,
      reloadData,
      closeForm,
    });
  });
});
