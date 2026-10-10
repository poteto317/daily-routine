import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";
import texts from "./locales/ja.json";

/** 同じ種別での重複を防ぎ、保存する名前を正規化する。 */
export const validateWorkoutExerciseName = (
  name: string,
  label: WorkoutLabel,
  exercises: readonly WorkoutExercise[],
  excludeId?: string,
): string => {
  const normalized = name.trim();
  if (!normalized || normalized.length > 100)
    throw new Error(texts.exercises.invalidName);
  if (
    exercises.some(
      (ex) =>
        ex.id !== excludeId && ex.label === label && ex.name === normalized,
    )
  ) {
    throw new Error(texts.exercises.duplicate);
  }
  return normalized;
};
