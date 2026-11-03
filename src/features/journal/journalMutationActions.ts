import {
  getJournalDateError,
  type JournalDateError,
} from "./utils/journalDate";
import { getChangedJournalDate } from "./journalFormDate";

/**
 * 日付を拒否するときの文言。invalid は空・形式違い・実在しない日付・下限（1900-01-01）より前、
 * future は今日より後
 */
export type JournalDateAlertMessages = {
  invalid: string;
  future: string;
};

/** 拒否の理由ごとに、どちらの文言で知らせるか */
const DATE_ERROR_ALERT_KEYS: Record<
  JournalDateError,
  keyof JournalDateAlertMessages
> = {
  "invalid-format": "invalid",
  "not-real": "invalid",
  "too-old": "invalid",
  future: "future",
};

/** 日付の検証に通らなければ理由を alert して true を返す */
const alertIfInvalidDate = (
  date: string,
  today: string,
  messages: JournalDateAlertMessages,
  alertFn: (message?: string) => void,
): boolean => {
  const error = getJournalDateError(date, today);
  if (error === null) return false;
  alertFn(messages[DATE_ERROR_ALERT_KEYS[error]]);
  return true;
};

type SaveJournalEntryArgs = {
  /** 保存する日付。未操作のときの既定値（今日）は呼び出し側で決める */
  date: string;
  /** 未来の判定の基準にする今日（YYYY-MM-DD） */
  today: string;
  titleInput: string;
  contentInput: string;
  defaultTitle: string;
  alertMessage: string;
  dateAlertMessages: JournalDateAlertMessages;
  saveEntry: (date: string, title: string, content: string) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

export const saveJournalEntryAndReload = ({
  date,
  today,
  titleInput,
  contentInput,
  defaultTitle,
  alertMessage,
  dateAlertMessages,
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

  // 新規追加は常に日付を検証する（空・不正・下限より前・未来は保存しない。入力とフォームは残す）
  if (alertIfInvalidDate(date, today, dateAlertMessages, alertFn)) {
    return false;
  }

  saveEntry(date, trimmedTitle || defaultTitle, trimmedContent);
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
  /** 編集前のエントリの日付。dateInput と比べて、日付を変えたかを決める */
  originalDate: string;
  /** 日付の入力。null は未操作で、編集前の日付として扱う */
  dateInput: string | null;
  /** 未来の判定の基準にする今日（YYYY-MM-DD） */
  today: string;
  titleInput: string;
  contentInput: string;
  defaultTitle: string;
  alertMessage: string;
  dateAlertMessages: JournalDateAlertMessages;
  updateEntry: (
    entryId: string,
    title: string,
    content: string,
    date?: string,
  ) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

export const updateJournalEntryAndReload = ({
  entryId,
  originalDate,
  dateInput,
  today,
  titleInput,
  contentInput,
  defaultTitle,
  alertMessage,
  dateAlertMessages,
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

  const changedDate = getChangedJournalDate(dateInput, originalDate);

  // 日付を変えたときだけ検証する（API で作った未来日などのエントリも、日付を変えなければ直せる）
  if (
    changedDate !== null &&
    alertIfInvalidDate(changedDate, today, dateAlertMessages, alertFn)
  ) {
    return false;
  }

  const title = trimmedTitle || defaultTitle;
  if (changedDate === null) {
    // 日付を変えないときは日付を渡さない（保存層でバケットを動かさない）
    updateEntry(entryId, title, trimmedContent);
  } else {
    updateEntry(entryId, title, trimmedContent, changedDate);
  }
  reloadData();
  closeForm();
  return true;
};
