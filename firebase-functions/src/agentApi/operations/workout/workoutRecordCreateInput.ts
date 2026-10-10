import { asJsonObject } from "../../validation/body";
import { readDate, required } from "../../validation";
import {
  assertRecordKeys,
  readExerciseId,
  readPositiveNumber,
} from "./workoutInput";
import type { WorkoutExercise } from "./workoutTypes";

import type { WorkoutRecordCreateInput } from "./workoutRecordCommands";
export type { WorkoutRecordCreateInput } from "./workoutRecordCommands";

export const parseWorkoutRecordCreateInput = (
  body: unknown,
  resolve: (id: string) => WorkoutExercise,
): WorkoutRecordCreateInput => {
  const input = asJsonObject(body);
  const date = required("date", readDate(input, "date"));
  const exerciseId = required("exerciseId", readExerciseId(input));
  const exercise = resolve(exerciseId);
  assertRecordKeys(input, exercise.label);
  const base = { date, exerciseId, exerciseName: exercise.name };
  if (exercise.label === "strength") {
    const sets = readPositiveNumber(input, "sets");
    return {
      ...base,
      label: "strength",
      weightKg: required("weightKg", readPositiveNumber(input, "weightKg")),
      reps: required("reps", readPositiveNumber(input, "reps")),
      ...(sets !== undefined ? { sets } : {}),
    };
  }
  return {
    ...base,
    label: "running",
    caloriesBurned: required(
      "caloriesBurned",
      readPositiveNumber(input, "caloriesBurned"),
    ),
  };
};
