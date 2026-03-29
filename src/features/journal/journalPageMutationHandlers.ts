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
} from "./journalMutationActions";

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
  titleInput: string;
  contentInput: string;
  reloadData: () => void;
  closeForm: () => void;
}) => {
  const { entryId, titleInput, contentInput, reloadData, closeForm } = params;

  return () => {
    return updateJournalEntryAndReload({
      entryId,
      titleInput,
      contentInput,
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      updateEntry: updateJournalEntry,
      reloadData,
      closeForm,
    });
  };
};

export const createSaveJournalEntryHandler = (params: {
  getToday: () => string;
  titleInput: string;
  contentInput: string;
  reloadData: () => void;
  closeForm: () => void;
}) => {
  const { getToday, titleInput, contentInput, reloadData, closeForm } = params;

  return () => {
    return saveJournalEntryAndReload({
      today: getToday(),
      titleInput,
      contentInput,
      defaultTitle: journalTexts.page.defaultTitle,
      alertMessage: journalTexts.page.alertMissingContent,
      saveEntry: saveJournalEntry,
      reloadData,
      closeForm,
    });
  };
};
