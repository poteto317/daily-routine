import { assertKnownKeys } from "../../validation/body";
import { readString, type JsonObject } from "../../validation";
import { invalidField } from "../../validation/fieldError";
import { type WorkoutLabel } from "./workoutTypes";

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
