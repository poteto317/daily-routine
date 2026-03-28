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
