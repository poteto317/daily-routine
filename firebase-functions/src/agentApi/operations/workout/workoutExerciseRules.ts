import { invalidField } from "../../validation/fieldError";
import type { WorkoutExercise, WorkoutLabel } from "./workoutTypes";

export const assertUniqueExerciseName = (
  exercises: WorkoutExercise[],
  name: string,
  label: WorkoutLabel,
  id?: string,
): void => {
  if (
    exercises.some(
      (ex) => ex.id !== id && ex.label === label && ex.name === name,
    )
  )
    throw invalidField("name", "同じ種類に同名の種目があります");
};
