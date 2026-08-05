import type { WorkoutLabel } from "@/types/routine";
import texts from "./locales/ja.json";
import type { NewWorkoutRecordInput } from "./storageRecords";

export type WorkoutRecordFormValues = {
  label: WorkoutLabel;
  date: string;
  exerciseName: string;
  weightKg: string;
  reps: string;
  sets: string;
  caloriesBurned: string;
};

export type WorkoutRecordFormValidation =
  | { valid: true; record: NewWorkoutRecordInput }
  | { valid: false; error: string };

const toPositiveNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num <= 0) return null;
  return num;
};

/**
 * 筋トレフォームの入力値（重量・回数・セット数）を検証する。
 */
export const validateStrengthWorkoutForm = (
  values: WorkoutRecordFormValues,
  exerciseName: string,
): WorkoutRecordFormValidation => {
  const weightKg = toPositiveNumber(values.weightKg);
  if (weightKg === null) {
    return { valid: false, error: texts.form.errorWeightRequired };
  }
  const reps = toPositiveNumber(values.reps);
  if (reps === null) {
    return { valid: false, error: texts.form.errorRepsRequired };
  }
  const sets = toPositiveNumber(values.sets);

  return {
    valid: true,
    record: {
      label: "strength",
      date: values.date,
      exerciseName,
      weightKg,
      reps,
      ...(sets !== null ? { sets } : {}),
    },
  };
};

/**
 * ランニングフォームの入力値（消費カロリー）を検証する。
 */
export const validateRunningWorkoutForm = (
  values: WorkoutRecordFormValues,
  exerciseName: string,
): WorkoutRecordFormValidation => {
  const caloriesBurned = toPositiveNumber(values.caloriesBurned);
  if (caloriesBurned === null) {
    return { valid: false, error: texts.form.errorCaloriesRequired };
  }

  return {
    valid: true,
    record: {
      label: "running",
      date: values.date,
      exerciseName,
      caloriesBurned,
    },
  };
};

/**
 * フォーム入力値をラベル（strength/running）に応じて検証し、
 * 有効なら永続化用のレコード（NewWorkoutRecordInput）を組み立てる。
 */
export const validateWorkoutRecordForm = (
  values: WorkoutRecordFormValues,
): WorkoutRecordFormValidation => {
  const exerciseName = values.exerciseName.trim();
  if (!exerciseName) {
    return { valid: false, error: texts.form.errorExerciseNameRequired };
  }

  return values.label === "strength"
    ? validateStrengthWorkoutForm(values, exerciseName)
    : validateRunningWorkoutForm(values, exerciseName);
};
