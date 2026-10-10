import type { WorkoutExercise } from "@/types/routine";
import { validateWorkoutExerciseName } from "./workoutExerciseValidation";
import texts from "./locales/ja.json";

/** 種目の検証と生成。ID・時刻の取得や保存は呼び出し元に任せる。 */
export const createWorkoutExercise = (
  input: Pick<WorkoutExercise, "name" | "label">,
  exercises: readonly WorkoutExercise[],
  id: string,
  now: string,
): WorkoutExercise => ({
  id,
  name: validateWorkoutExerciseName(input.name, input.label, exercises),
  label: input.label,
  createdAt: now,
  updatedAt: now,
});

export const renameWorkoutExerciseInList = (
  exercises: readonly WorkoutExercise[],
  id: string,
  name: string,
  now: string,
): WorkoutExercise => {
  const existing = exercises.find((exercise) => exercise.id === id);
  if (!existing) throw new Error(texts.exercises.notFound);
  return {
    ...existing,
    name: validateWorkoutExerciseName(name, existing.label, exercises, id),
    updatedAt: now,
  };
};

export const removeWorkoutExerciseFromList = (
  exercises: readonly WorkoutExercise[],
  id: string,
): WorkoutExercise[] => {
  if (!exercises.some((exercise) => exercise.id === id)) {
    throw new Error(texts.exercises.notFound);
  }
  return exercises.filter((exercise) => exercise.id !== id);
};
