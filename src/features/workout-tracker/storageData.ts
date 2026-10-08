import texts from "./locales/ja.json";
import { type WorkoutRecordHistory } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import { STORAGE_KEY_WORKOUT_RECORDS } from "./storageKeys";

export const getWorkoutRecordHistory = (): WorkoutRecordHistory => {
  return getStorageItem<WorkoutRecordHistory>(STORAGE_KEY_WORKOUT_RECORDS, {});
};

export const saveWorkoutRecordHistory = (
  history: WorkoutRecordHistory,
): void => {
  if (!setStorageItem(STORAGE_KEY_WORKOUT_RECORDS, history)) {
    throw new Error(texts.exercises.saveFailed);
  }
};
