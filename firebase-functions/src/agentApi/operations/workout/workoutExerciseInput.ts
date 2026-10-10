import { emptyPatch } from "../../errors";
import {
  parseBody,
  readEnum,
  readString,
  required,
  type JsonObject,
} from "../../validation";
import { WORKOUT_LABELS } from "./workoutTypes";
const nameOptions = { maxLength: 100, trim: true } as const;
export const parseWorkoutExerciseCreateInput = (body: unknown) => {
  const input = parseBody(body, ["name", "label"]);
  const name = required("name", readString(input, "name", nameOptions));
  const label = required("label", readEnum(input, "label", WORKOUT_LABELS));
  return { name, label };
};
export const parseWorkoutExerciseNamePatch = (input: JsonObject): string => {
  if (!Object.keys(input).length) throw emptyPatch();
  return required("name", readString(input, "name", nameOptions));
};
