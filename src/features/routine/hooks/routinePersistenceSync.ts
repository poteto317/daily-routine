import {
  createNotificationSchedules,
  scheduleNotifications,
} from "@/features/notification";
import { saveRoutines } from "@/features/routine/storage";
import type { Routine } from "@/types/routine";
import { syncRoutinesToFirebase as syncToFirebase } from "../helpers";
import { stripCompletionState } from "./routineStateModel";

export const syncRoutines = async (
  routines: Routine[],
  functionsUrl?: string,
): Promise<unknown> => {
  return syncToFirebase(routines, functionsUrl);
};

/** localStorage 保存後に他の useRoutines インスタンスへ変更を通知するイベント名 */
export const ROUTINES_SAVED_EVENT = "routines-saved" as const;

export const saveAndSyncRoutines = (
  routines: Routine[],
  functionsUrl?: string,
): void => {
  saveRoutines(stripCompletionState(routines));

  // 他ページの useRoutines インスタンス（PresetPage → HomePage など）に変更を通知
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ROUTINES_SAVED_EVENT));
  }

  void syncRoutines(routines, functionsUrl).catch(() => {
    // Sync failed silently
  });
};

export const updateNotificationSchedules = async (
  routines: Routine[],
): Promise<unknown> => {
  const schedules = createNotificationSchedules(routines);
  return scheduleNotifications(schedules);
};
