import {
  getDailyProgress,
  getMonthlyHistory,
  getRoutines,
  saveDailyProgressForSync,
  saveMonthlyHistory,
  saveRoutines,
} from "@/features/routine/storage";
import {
  getLocalDataUpdatedAt,
  getUnscopedStorageItem,
  setLocalDataUpdatedAt,
  setUnscopedStorageItem,
  withSyncBatch,
} from "@/lib/storage/core";
import { getSettings, saveSettings } from "@/features/settings/storage";
import {
  getPomodoroHistory,
  savePomodoroHistory,
} from "@/features/pomodoro/storage";
import {
  getWorkSessionHistory,
  getWorkTemplates,
  saveWorkSessionHistory,
  saveWorkTemplates,
} from "@/features/work-tracker/storage";
import {
  getWeightHistory,
  saveWeightHistory,
} from "@/features/weight-tracker/storage";
import {
  getJournalHistory,
  saveJournalHistory,
} from "@/features/journal/storage";
import { getBudgetData, saveBudgetData } from "@/features/budget/storage";
import { getMealHistory, saveMealHistory } from "@/features/meal/storage";
import { getPresets, savePresets } from "@/features/preset/storage";
import { getTodoLists, saveTodoLists } from "@/features/todo-lists/storage";
import { DEVICE_ID_KEY } from "./constants";
import { createDeviceId, hasAnyLocalSyncData } from "./localDataHelpers";
import { collectLatestTimestamp } from "./timestamp";
import type { SyncData } from "./types";

export const getDeviceId = (): string => {
  // JSON 形式で保存された値を試みる
  let deviceId = getUnscopedStorageItem<string>(DEVICE_ID_KEY, "");

  // 後方互換: 旧形式（生文字列）が残っている場合はそのまま採用して JSON 形式へ移行
  if (!deviceId) {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(DEVICE_ID_KEY)
        : null;
    if (raw && !raw.startsWith('"')) {
      deviceId = raw;
      setUnscopedStorageItem(DEVICE_ID_KEY, deviceId, {
        skipLocalDataUpdatedAt: true,
      });
    }
  }

  if (!deviceId) {
    deviceId = createDeviceId();
    setUnscopedStorageItem(DEVICE_ID_KEY, deviceId, {
      skipLocalDataUpdatedAt: true,
    });
  }

  return deviceId;
};

export const collectLocalSyncData = (): Omit<
  SyncData,
  "lastModified" | "deviceId"
> => ({
  routines: getRoutines(),
  dailyProgress: getDailyProgress(),
  dailyHistory: getMonthlyHistory(),
  settings: getSettings(),
  pomodoroHistory: getPomodoroHistory(),
  workSessionHistory: getWorkSessionHistory(),
  workTemplates: getWorkTemplates(),
  weightHistory: getWeightHistory(),
  journalHistory: getJournalHistory(),
  budgetData: getBudgetData(),
  mealHistory: getMealHistory(),
  presets: getPresets(),
  todoLists: getTodoLists(),
});

export const saveSyncDataToLocal = (data: Partial<SyncData>): void => {
  withSyncBatch(() => {
    saveRoutines(data.routines ?? []);
    if (data.dailyProgress) {
      saveDailyProgressForSync(data.dailyProgress);
    }
    saveMonthlyHistory(data.dailyHistory ?? {});
    saveSettings(data.settings ?? getSettings());
    savePomodoroHistory(data.pomodoroHistory ?? {});
    saveWorkSessionHistory(data.workSessionHistory ?? {});
    saveWorkTemplates(data.workTemplates ?? []);
    saveWeightHistory(data.weightHistory ?? {});
    saveJournalHistory(data.journalHistory ?? {});
    saveBudgetData(data.budgetData ?? { budgets: {}, expenses: {} });
    saveMealHistory(data.mealHistory ?? {});
    savePresets(data.presets ?? []);
    saveTodoLists(data.todoLists ?? []);
  });
  setLocalDataUpdatedAt(data.lastModified ?? Date.now());
};

export const hasLocalData = (): boolean => {
  const data = collectLocalSyncData();

  return hasAnyLocalSyncData(data);
};

export const getLocalLastModified = (): number => {
  const explicitLocalLastModified = getLocalDataUpdatedAt();
  if (explicitLocalLastModified > 0) {
    return explicitLocalLastModified;
  }

  return collectLatestTimestamp(collectLocalSyncData());
};
