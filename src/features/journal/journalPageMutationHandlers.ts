import type { JournalEntry } from "@/types/routine";
import journalTexts from "./locales/ja.json";
import { confirmDeleteEntry } from "./helpers";
import {
  deleteJournalEntry,
  saveJournalEntry,
  updateJournalEntry,
} from "./storage";
import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
  updateJournalEntryAndReload,
  type JournalDateAlertMessages,
} from "./journalMutationActions";

const JOURNAL_DATE_ALERT_MESSAGES: JournalDateAlertMessages = {
  invalid: journalTexts.page.alertInvalidDate,
  future: journalTexts.page.alertFutureDate,
};

export const createDeleteJournalEntryHandler = (params: {
  reloadData: () => void;
}) => {
  const { reloadData } = params;

  return (entry: JournalEntry) => {
    return deleteJournalEntryAndReload({
      entryId: entry.id,
      confirmMessage: confirmDeleteEntry(entry.date),
      deleteEntry: deleteJournalEntry,
      reloadData,
    });
  };
};

export const createUpdateJournalEntryHandler = (params: {
  entryId: string;
  originalDate: string;
  dateInput: string | null;
  getToday: () => string;
  titleInput: string;
  contentInput: string;
  reloadData: () => void;
  closeForm: () => void;
}) => {
  const {
    entryId,
    originalDate,
    dateInput,
    getToday,
    titleInput,
    contentInput,
    reloadData,
    closeForm,
  } = params;

  return () => {
    return updateJournalEntryAndReload({
      entryId,
      originalDate,
      dateInput,
      // 今日は入口で 1 回だけ取る
      today: getToday(),
      titleInput,
      contentInput,
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      dateAlertMessages: JOURNAL_DATE_ALERT_MESSAGES,
      updateEntry: updateJournalEntry,
      reloadData,
      closeForm,
    });
  };
};

export const createSaveJournalEntryHandler = (params: {
  getToday: () => string;
  dateInput: string | null;
  titleInput: string;
  contentInput: string;
  reloadData: () => void;
  closeForm: () => void;
}) => {
  const {
    getToday,
    dateInput,
    titleInput,
    contentInput,
    reloadData,
    closeForm,
  } = params;

  return () => {
    // 今日は入口で 1 回だけ取り、未操作時の既定値と未来の判定の両方に使う
    const today = getToday();
    return saveJournalEntryAndReload({
      today,
      date: dateInput ?? today,
      titleInput,
      contentInput,
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      dateAlertMessages: JOURNAL_DATE_ALERT_MESSAGES,
      saveEntry: saveJournalEntry,
      reloadData,
      closeForm,
    });
  };
};
