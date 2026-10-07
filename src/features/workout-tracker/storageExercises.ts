import type { WorkoutExercise } from "@/types/routine";
import { generateId, getStorageItem, setStorageItem } from "@/lib/storage/core";
import { STORAGE_KEY_WORKOUT_EXERCISES } from "./storageKeys";
import { validateWorkoutExerciseName } from "./workoutExerciseValidation";
import texts from "./locales/ja.json";

export const getWorkoutExercises = (): WorkoutExercise[] =>
  getStorageItem(STORAGE_KEY_WORKOUT_EXERCISES, []);
export const saveWorkoutExercises = (exercises: WorkoutExercise[]): boolean =>
  setStorageItem(STORAGE_KEY_WORKOUT_EXERCISES, exercises);

const persist = (exercises: WorkoutExercise[]): void => {
  if (!saveWorkoutExercises(exercises))
    throw new Error(texts.exercises.saveFailed);
};

/** 新しい種目を作成する。過去の記録には触れない。 */
export const addWorkoutExercise = (
  input: Pick<WorkoutExercise, "name" | "label">,
): WorkoutExercise => {
  const exercises = getWorkoutExercises();
  const name = validateWorkoutExerciseName(input.name, input.label, exercises);
  const now = new Date().toISOString();
  const exercise: WorkoutExercise = {
    id: generateId("workout-exercise"),
    name,
    label: input.label,
    createdAt: now,
    updatedAt: now,
  };
  persist([...exercises, exercise]);
  return exercise;
};

export const renameWorkoutExercise = (
  id: string,
  name: string,
): WorkoutExercise => {
  const exercises = getWorkoutExercises();
  const existing = exercises.find((ex) => ex.id === id);
  if (!existing) throw new Error(texts.exercises.notFound);
  const updated = {
    ...existing,
    name: validateWorkoutExerciseName(name, existing.label, exercises, id),
    updatedAt: new Date().toISOString(),
  };
  persist(exercises.map((ex) => (ex.id === id ? updated : ex)));
  return updated;
};

/** 種目の削除後も、記録に保存された ID と名前を残す。 */
export const deleteWorkoutExercise = (id: string): void => {
  const exercises = getWorkoutExercises();
  if (!exercises.some((ex) => ex.id === id))
    throw new Error(texts.exercises.notFound);
  persist(exercises.filter((ex) => ex.id !== id));
};
