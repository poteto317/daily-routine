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
  getJournalHistory,
  saveJournalHistory,
} from "@/features/journal/storage";
import {
  getBudgetCategories,
  getBudgetData,
  getBudgetExpenseItems,
  getBudgetIncomeItems,
  saveBudgetCategories,
  saveBudgetData,
  saveBudgetExpenseItems,
  saveBudgetIncomeItems,
} from "@/features/budget/storage";
import { getMealHistory, saveMealHistory } from "@/features/meal/storage";
import { getPresets, savePresets } from "@/features/preset/storage";
import { getTodoLists, saveTodoLists } from "@/features/todo-lists/storage";
import { hasAnyLocalSyncData } from "./localDataHelpers";
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
  journalHistory: getJournalHistory(),
  budgetData: getBudgetData(),
  budgetCategories: getBudgetCategories(),
  budgetIncomeItems: getBudgetIncomeItems(),
  budgetExpenseItems: getBudgetExpenseItems(),
  mealHistory: getMealHistory(),
  presets: getPresets(),
  todoLists: getTodoLists(),
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
    saveJournalHistory(data.journalHistory ?? {});
    saveBudgetData(data.budgetData ?? { expenses: {} });
    saveBudgetCategories(data.budgetCategories ?? []);
    saveBudgetIncomeItems(data.budgetIncomeItems ?? []);
    saveBudgetExpenseItems(data.budgetExpenseItems ?? []);
    saveMealHistory(data.mealHistory ?? {});
    savePresets(data.presets ?? []);
    saveTodoLists(data.todoLists ?? []);
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
