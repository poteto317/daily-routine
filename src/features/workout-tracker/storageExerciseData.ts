import type { WorkoutExercise } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import { STORAGE_KEY_WORKOUT_EXERCISES } from "./storageKeys";
import texts from "./locales/ja.json";

export const getWorkoutExercises = (): WorkoutExercise[] =>
  getStorageItem(STORAGE_KEY_WORKOUT_EXERCISES, []);
/** 同期・バックアップを含む全ての呼び出し元に書き込み失敗を伝える。 */
export const saveWorkoutExercises = (exercises: WorkoutExercise[]): void => {
  if (!setStorageItem(STORAGE_KEY_WORKOUT_EXERCISES, exercises)) {
    throw new Error(texts.exercises.saveFailed);
  }
};
