import texts from "../locales/ja.json";

export const WEIGHT_HISTORY_TODAY_BADGE = texts.historyItem.todayBadge;
export const WEIGHT_HISTORY_NOTE_PREFIX = texts.historyItem.notePrefix;
export const WEIGHT_HISTORY_DELETE_ARIA_LABEL =
  texts.historyItem.deleteAriaLabel;

export const getWeightChangeClassName = (change: number): string => {
  if (change > 0) return "text-sm font-medium text-red-600";
  if (change < 0) return "text-sm font-medium text-green-600";
  return "text-sm font-medium text-gray-600";
};

export const formatWeightChange = (change: number): string =>
  `${change > 0 ? "+" : ""}${change.toFixed(1)} kg`;

export const formatWeightHistoryNote = (notes: string): string =>
  `${WEIGHT_HISTORY_NOTE_PREFIX} ${notes}`;

export const WEIGHT_TRACKER_HISTORY_LIST_TEXT = {
  title: texts.historyList.title,
  empty: texts.historyList.empty,
} as const;
