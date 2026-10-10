import type { NewWorkoutRecordInput, WorkoutLabel } from "@/types/routine";

export type WorkoutRecordFormValues = {
  label: WorkoutLabel;
  date: string;
  exerciseId: string;
  weightKg: string;
  reps: string;
  sets: string;
  caloriesBurned: string;
};

export type WorkoutRecordFormValidation =
  | { valid: true; record: NewWorkoutRecordInput }
  | { valid: false; error: string };
