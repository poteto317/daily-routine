import type { WorkoutExercise, WorkoutLabel } from "./workoutTypes";
export const createWorkoutExercise = (
  input: { name: string; label: WorkoutLabel },
  id: string,
  now: Date,
): WorkoutExercise => ({
  ...input,
  id,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
});
export const renameWorkoutExercise = (
  existing: WorkoutExercise,
  name: string,
  now: Date,
): WorkoutExercise => ({
  ...existing,
  name,
  updatedAt: now.toISOString(),
});
