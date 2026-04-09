import {
  getRoutines,
  getDailyProgress,
  getMonthlyHistory,
  saveRoutines,
  saveDailyProgress,
  saveMonthlyHistory,
} from "@/features/routine/storage";
import { getSettings, saveSettings } from "@/features/settings/storage";
import { type TransferOptions } from "./constants";
import { type AppSettings, type DailyProgress, type MonthlyHistory } from "@/types/routine";
import { DATA_TRANSFER_ERROR_MESSAGES } from "./errorMessages";

export type ImportPayload = {
  routines?: unknown;
  progress?: unknown;
  history?: unknown;
  settings?: unknown;
};

export const createExportData = (options: TransferOptions) => {
  const data: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    version: "2.0",
  };
  if (options.routines) data.routines = getRoutines();
  if (options.progress) data.progress = getDailyProgress();
  if (options.history) data.history = getMonthlyHistory();
  if (options.settings) data.settings = getSettings();
  return data;
};

export const downloadExportData = (options: TransferOptions, data: object) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const date = new Date().toISOString().split("T")[0];
  const types = Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join("-");
  anchor.download = `daily-routine-${types}-${date}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const getSelectedTypeLabels = (options: TransferOptions) => {
  return Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => {
      switch (key) {
        case "routines":
          return "ルーティン";
        case "progress":
          return "今日の進捗";
        case "history":
          return "達成履歴";
        case "settings":
          return "設定";
        default:
          return key;
      }
    });
};

export const importSelectedData = (
  data: ImportPayload,
  options: TransferOptions,
) => {
  if (options.routines && data.routines) {
    if (!Array.isArray(data.routines))
      throw new Error(DATA_TRANSFER_ERROR_MESSAGES.invalidRoutinesFormat);
    saveRoutines(data.routines);
  }
  if (options.progress && data.progress) {
    saveDailyProgress(data.progress as DailyProgress);
  }
  if (options.history && data.history) {
    if (typeof data.history !== "object")
      throw new Error(DATA_TRANSFER_ERROR_MESSAGES.invalidHistoryFormat);
    saveMonthlyHistory(data.history as MonthlyHistory);
  }
  if (options.settings && data.settings) {
    saveSettings(data.settings as AppSettings);
  }
};
