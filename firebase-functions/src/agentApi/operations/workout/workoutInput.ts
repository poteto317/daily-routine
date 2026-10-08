import { ApiError } from "../../errors";
import { assertKnownKeys } from "../../validation/body";
import { readString, type JsonObject } from "../../validation";
import { invalidField } from "../../validation/fieldError";
import { WORKOUT_LABELS, type WorkoutLabel } from "./workoutTypes";

export const readExerciseId = (input: JsonObject): string | undefined =>
  readString(input, "exerciseId", { maxLength: 200, trim: true });

/** 金額の上限を流用せず、運動記録は正の有限数を受け付ける。 */
export const readPositiveNumber = (
  input: JsonObject,
  field: string,
): number | undefined => {
  const value = input[field];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
    throw invalidField(field, "0より大きい有限数を指定してください");
  return value;
};
export const assertRecordKeys = (
  input: JsonObject,
  label: WorkoutLabel,
): void =>
  assertKnownKeys(input, [
    "date",
    "exerciseId",
    ...(label === "strength"
      ? ["weightKg", "reps", "sets"]
      : ["caloriesBurned"]),
  ]);

export const parseWorkoutLabelQuery = (
  value: string | undefined,
): WorkoutLabel | undefined => {
  if (value === undefined) return undefined;
  if (!(WORKOUT_LABELS as readonly string[]).includes(value))
    throw new ApiError(
      400,
      "invalid_query",
      "label は strength または running を指定してください",
    );
  return value as WorkoutLabel;
};
export const parseExerciseIdQuery = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  const id = value.trim();
  if (!id || id.length > 200)
    throw new ApiError(
      400,
      "invalid_query",
      "exerciseId は1〜200文字で指定してください",
    );
  return id;
};
