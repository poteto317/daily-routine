import type { WeightHistory, WeightRecord } from "@/types/routine";
import texts from "../locales/ja.json";

export const getTodayDateKey = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const formatWeightDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export const calculateWeightChange = (
  currentWeight: number,
  previousWeight: number,
): number => {
  return currentWeight - previousWeight;
};

export const getRecentWeightRecords = (
  history: WeightHistory,
  limit = 30,
): WeightRecord[] => {
  return Object.values(history)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
};

// Page texts and functions
export const WEIGHT_TRACKER_PAGE_TEXT = {
  title: texts.page.title,
} as const;

export const WEIGHT_TRACKER_MESSAGES = {
  alertInvalidWeight: texts.page.alertInvalidWeight,
  confirmDeleteTemplate: (date: string) =>
    texts.page.confirmDeleteTemplate.replace("{date}", date),
} as const;

// Form texts
export const WEIGHT_FORM_WEIGHT_LABEL = texts.form.weightLabel;
export const WEIGHT_FORM_WEIGHT_PLACEHOLDER = texts.form.weightPlaceholder;
export const WEIGHT_FORM_NOTES_LABEL = texts.form.notesLabel;
export const WEIGHT_FORM_NOTES_PLACEHOLDER = texts.form.notesPlaceholder;
export const WEIGHT_FORM_SAVE_LABEL = texts.form.saveLabel;
export const WEIGHT_FORM_CANCEL_LABEL = texts.form.cancelLabel;

// Today card texts and functions
export const WEIGHT_TODAY_TITLE = texts.todayCard.title;
export const WEIGHT_TODAY_ADD_LABEL = texts.todayCard.addLabel;
export const WEIGHT_TODAY_EDIT_LABEL = texts.todayCard.editLabel;
export const WEIGHT_TODAY_NOTE_PREFIX = texts.todayCard.notePrefix;
export const WEIGHT_TODAY_UPDATED_AT_LABEL = texts.todayCard.updatedAtLabel;
export const WEIGHT_TODAY_EMPTY_LABEL = texts.todayCard.emptyLabel;

export const getWeightTodayEditButtonLabel = (hasRecord: boolean): string => {
  return hasRecord ? WEIGHT_TODAY_EDIT_LABEL : WEIGHT_TODAY_ADD_LABEL;
};

export const formatWeightTodayNote = (notes: string): string => {
  return `${WEIGHT_TODAY_NOTE_PREFIX} ${notes}`;
};

// History item texts and functions
export const WEIGHT_HISTORY_TODAY_BADGE = texts.historyItem.todayBadge;
export const WEIGHT_HISTORY_NOTE_PREFIX = texts.historyItem.notePrefix;
export const WEIGHT_HISTORY_DELETE_ARIA_LABEL = texts.historyItem.deleteAriaLabel;

export const getWeightChangeClassName = (change: number): string => {
  if (change > 0) return "text-sm font-medium text-red-600";
  if (change < 0) return "text-sm font-medium text-green-600";
  return "text-sm font-medium text-gray-600";
};

export const formatWeightChange = (change: number): string => {
  return `${change > 0 ? "+" : ""}${change.toFixed(1)} kg`;
};

export const formatWeightHistoryNote = (notes: string): string => {
  return `${WEIGHT_HISTORY_NOTE_PREFIX} ${notes}`;
};

// History list texts
export const WEIGHT_TRACKER_HISTORY_LIST_TEXT = {
  title: texts.historyList.title,
  empty: texts.historyList.empty,
} as const;
