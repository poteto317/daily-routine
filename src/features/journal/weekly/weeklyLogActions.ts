import journalTexts from "../locales/ja.json";
import { deleteWeeklyLog, saveWeeklyLog } from "./weeklyLogStorage";
import { buildWeeklyLogDeleteConfirmMessage } from "./weeklyLogTexts";

type SaveWeeklyLogArgs = {
  weekStart: string;
  content: string;
  reloadData: () => void;
  closeForm: () => void;
  saveLog?: (weekStart: string, content: string) => boolean;
  alertFn?: (message?: string) => void;
};

export const saveWeeklyLogAndReload = ({
  weekStart,
  content,
  reloadData,
  closeForm,
  saveLog = saveWeeklyLog,
  alertFn = window.alert,
}: SaveWeeklyLogArgs): boolean => {
  if (content.trim() === "") {
    alertFn(journalTexts.weeklyLog.alertMissingContent);
    return false;
  }

  const saved = saveLog(weekStart, content);
  // 成否にかかわらず読み直し、画面とストレージを食い違わせない
  reloadData();
  if (saved) closeForm();
  return saved;
};

type DeleteWeeklyLogArgs = {
  weekStart: string;
  reloadData: () => void;
  deleteLog?: (weekStart: string) => boolean;
  confirmFn?: (message?: string) => boolean;
};

export const deleteWeeklyLogAndReload = ({
  weekStart,
  reloadData,
  deleteLog = deleteWeeklyLog,
  confirmFn = window.confirm,
}: DeleteWeeklyLogArgs): boolean => {
  if (!confirmFn(buildWeeklyLogDeleteConfirmMessage(weekStart))) {
    return false;
  }

  const deleted = deleteLog(weekStart);
  reloadData();
  return deleted;
};
