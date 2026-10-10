import type { WorkoutExercise } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import {
  getWorkoutExercises,
  saveWorkoutExercises,
} from "./storageExerciseData";
import {
  createWorkoutExercise,
  renameWorkoutExerciseInList,
  removeWorkoutExerciseFromList,
} from "./workoutExerciseMutations";

export {
  getWorkoutExercises,
  saveWorkoutExercises,
} from "./storageExerciseData";

/** 種目の保存だけを行い、過去の記録には触れない。 */
export const addWorkoutExercise = (
  input: Pick<WorkoutExercise, "name" | "label">,
): WorkoutExercise => {
  const exercises = getWorkoutExercises();
  const exercise = createWorkoutExercise(
    input,
    exercises,
    generateId("workout-exercise"),
    new Date().toISOString(),
  );
  saveWorkoutExercises([...exercises, exercise]);
  return exercise;
};

export const renameWorkoutExercise = (
  id: string,
  name: string,
): WorkoutExercise => {
  const exercises = getWorkoutExercises();
  const updated = renameWorkoutExerciseInList(
    exercises,
    id,
    name,
    new Date().toISOString(),
  );
  saveWorkoutExercises(
    exercises.map((exercise) => (exercise.id === id ? updated : exercise)),
  );
  return updated;
};

export const deleteWorkoutExercise = (id: string): void => {
  saveWorkoutExercises(
    removeWorkoutExerciseFromList(getWorkoutExercises(), id),
  );
};
