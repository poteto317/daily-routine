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
  setLocalDataUpdatedAt,
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
  getWorkoutRecordHistory,
  saveWorkoutRecordHistory,
} from "@/features/workout-tracker/storage";
import {
  getJournalHistory,
  saveJournalHistory,
} from "@/features/journal/storage";
import { getMealHistory, saveMealHistory } from "@/features/meal/storage";
import { getPresets, savePresets } from "@/features/preset/storage";
import {
  collectBudgetSyncData,
  normalizeBudgetSyncData,
  saveBudgetSyncData,
} from "./budgetSyncData";
import { hasAnyLocalSyncData } from "./localDataHelpers";
import {
  collectTodoListSyncData,
  normalizeTodoListSyncData,
  saveTodoListSyncData,
} from "./todoListSyncData";
import { collectLatestTimestamp } from "./timestamp";
import type { SyncData } from "./types";

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
  workoutRecordHistory: getWorkoutRecordHistory(),
  journalHistory: getJournalHistory(),
  ...collectBudgetSyncData(),
  mealHistory: getMealHistory(),
  presets: getPresets(),
  ...collectTodoListSyncData(),
});

export const saveSyncDataToLocal = (
  data: Partial<SyncData>,
  options?: { skipTimestampUpdate?: boolean },
): void => {
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
    saveWorkoutRecordHistory(data.workoutRecordHistory ?? {});
    saveJournalHistory(data.journalHistory ?? {});
    saveBudgetSyncData(normalizeBudgetSyncData(data));
    saveMealHistory(data.mealHistory ?? {});
    savePresets(data.presets ?? []);
    saveTodoListSyncData(normalizeTodoListSyncData(data));
  });
  if (!options?.skipTimestampUpdate) {
    setLocalDataUpdatedAt(data.lastModified ?? Date.now());
  }
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
