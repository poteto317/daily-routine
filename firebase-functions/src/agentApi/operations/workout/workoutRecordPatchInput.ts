import { emptyPatch } from "../../errors";
import { readDate, type JsonObject } from "../../validation";
import { invalidField } from "../../validation/fieldError";
import {
  assertRecordKeys,
  readExerciseId,
  readPositiveNumber,
} from "./workoutInput";
import type { WorkoutExercise, WorkoutLabel } from "./workoutTypes";

import type { WorkoutRecordPatch } from "./workoutRecordCommands";
export type { WorkoutRecordPatch } from "./workoutRecordCommands";

export const parseWorkoutRecordPatchInput = (
  input: JsonObject,
  label: WorkoutLabel,
  resolve: (id: string) => WorkoutExercise,
): WorkoutRecordPatch => {
  assertRecordKeys(input, label);
  if (!Object.keys(input).length) throw emptyPatch();
  const date = readDate(input, "date");
  const exerciseId = readExerciseId(input);
  const exercise = exerciseId === undefined ? undefined : resolve(exerciseId);
  if (exercise && exercise.label !== label)
    throw invalidField("exerciseId", "異なる種類の種目には変更できません");
  const base = { date, exercise };
  return label === "strength"
    ? {
        ...base,
        weightKg: readPositiveNumber(input, "weightKg"),
        reps: readPositiveNumber(input, "reps"),
        sets: input.sets === null ? null : readPositiveNumber(input, "sets"),
      }
    : { ...base, caloriesBurned: readPositiveNumber(input, "caloriesBurned") };
};
