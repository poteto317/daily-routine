import { hasBudgetSyncData } from "./budgetSyncData";
import { hasTodoListSyncData } from "./todoListSyncData";
import type { SyncPayload } from "./types";

type LocalSyncDataSummary = SyncPayload;

export const createDeviceId = (): string => {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const hasAnyLocalSyncData = (data: LocalSyncDataSummary): boolean => {
  return (
    data.routines.length > 0 ||
    !!data.dailyProgress ||
    Object.keys(data.dailyHistory).length > 0 ||
    Object.keys(data.pomodoroHistory).length > 0 ||
    Object.keys(data.workSessionHistory).length > 0 ||
    data.workTemplates.length > 0 ||
    Object.keys(data.weightHistory).length > 0 ||
    Object.keys(data.journalHistory).length > 0 ||
    hasBudgetSyncData(data) ||
    Object.keys(data.mealHistory).length > 0 ||
    data.presets.length > 0 ||
    hasTodoListSyncData(data)
  );
};
