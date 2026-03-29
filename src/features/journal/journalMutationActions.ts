type SaveJournalEntryArgs = {
  today: string;
  titleInput: string;
  contentInput: string;
  defaultTitle: string;
  alertMessage: string;
  saveEntry: (date: string, title: string, content: string) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

export const saveJournalEntryAndReload = ({
  today,
  titleInput,
  contentInput,
  defaultTitle,
  alertMessage,
  saveEntry,
  reloadData,
  closeForm,
  alertFn = window.alert,
}: SaveJournalEntryArgs): boolean => {
  const trimmedTitle = titleInput.trim();
  const trimmedContent = contentInput.trim();

  if (!trimmedTitle && !trimmedContent) {
    alertFn(alertMessage);
    return false;
  }

  saveEntry(today, trimmedTitle || defaultTitle, trimmedContent);
  reloadData();
  closeForm();
  return true;
};

type DeleteJournalEntryArgs = {
  entryId: string;
  confirmMessage: string;
  deleteEntry: (entryId: string) => void;
  reloadData: () => void;
  confirmFn?: (message?: string) => boolean;
};

export const deleteJournalEntryAndReload = ({
  entryId,
  confirmMessage,
  deleteEntry,
  reloadData,
  confirmFn = window.confirm,
}: DeleteJournalEntryArgs): boolean => {
  if (!confirmFn(confirmMessage)) {
    return false;
  }

  deleteEntry(entryId);
  reloadData();
  return true;
};

type UpdateJournalEntryArgs = {
  entryId: string;
  titleInput: string;
  contentInput: string;
  defaultTitle: string;
  alertMessage: string;
  updateEntry: (entryId: string, title: string, content: string) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

export const updateJournalEntryAndReload = ({
  entryId,
  titleInput,
  contentInput,
  defaultTitle,
  alertMessage,
  updateEntry,
  reloadData,
  closeForm,
  alertFn = window.alert,
}: UpdateJournalEntryArgs): boolean => {
  if (!entryId) {
    throw new Error("updateJournalEntryAndReload: entryId is required");
  }

  const trimmedTitle = titleInput.trim();
  const trimmedContent = contentInput.trim();

  if (!trimmedTitle && !trimmedContent) {
    alertFn(alertMessage);
    return false;
  }

  updateEntry(entryId, trimmedTitle || defaultTitle, trimmedContent);
  reloadData();
  closeForm();
  return true;
};
