import type { WorkoutRecord } from "./workoutTypes";
import type {
  WorkoutRecordCreateInput,
  WorkoutRecordPatch,
} from "./workoutRecordCommands";

export const createWorkoutRecord = (
  input: WorkoutRecordCreateInput,
  id: string,
  now: Date,
): WorkoutRecord => ({
  ...input,
  id,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
});
export const updateWorkoutRecord = (
  existing: WorkoutRecord,
  patch: WorkoutRecordPatch,
  now: Date,
): WorkoutRecord => {
  const record = { ...existing, updatedAt: now.toISOString() };
  if (patch.date !== undefined) record.date = patch.date;
  // 同じ ID の再指定では記録時の名前を保つ。
  if (patch.exercise && patch.exercise.id !== record.exerciseId) {
    record.exerciseId = patch.exercise.id;
    record.exerciseName = patch.exercise.name;
  }
  if (record.label === "strength") {
    if (patch.weightKg !== undefined) record.weightKg = patch.weightKg;
    if (patch.reps !== undefined) record.reps = patch.reps;
    if (patch.sets === null) delete record.sets;
    else if (patch.sets !== undefined) record.sets = patch.sets;
  } else if (patch.caloriesBurned !== undefined)
    record.caloriesBurned = patch.caloriesBurned;
  return record;
};
