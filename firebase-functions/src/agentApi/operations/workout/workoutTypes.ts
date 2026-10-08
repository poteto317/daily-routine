export const WORKOUT_LABELS = ["strength", "running"] as const;
export type WorkoutLabel = (typeof WORKOUT_LABELS)[number];
export type WorkoutExercise = {
  id: string;
  name: string;
  label: WorkoutLabel;
  createdAt: string;
  updatedAt: string;
};
type RecordBase = {
  id: string;
  date: string;
  exerciseId?: string;
  exerciseName: string;
  createdAt: string;
  updatedAt: string;
};
export type WorkoutRecord = RecordBase &
  (
    | { label: "strength"; weightKg: number; reps: number; sets?: number }
    | { label: "running"; caloriesBurned: number }
  );
export type WorkoutHistory = Record<string, WorkoutRecord[]>;
