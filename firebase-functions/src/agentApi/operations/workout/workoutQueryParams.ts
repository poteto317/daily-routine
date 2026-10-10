import { ApiError } from "../../errors";
import { WORKOUT_LABELS, type WorkoutLabel } from "./workoutTypes";

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
