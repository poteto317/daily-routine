import type {
  NewWorkoutRecordInput,
  WorkoutLabel,
  WorkoutExercise,
} from "@/types/routine";
import texts from "./locales/ja.json";

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

const toPositiveNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;
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
  if (values.sets.trim() !== "" && sets === null) {
    return { valid: false, error: texts.form.errorSetsRequired };
  }

  return {
    valid: true,
    record: {
      label: "strength",
      date: values.date,
      exerciseName,
      exerciseId: values.exerciseId,
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
      exerciseId: values.exerciseId,
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
  exercises: WorkoutExercise[],
): WorkoutRecordFormValidation => {
  const exercise = exercises.find(
    (ex) => ex.id === values.exerciseId && ex.label === values.label,
  );
  if (!exercise) {
    return { valid: false, error: texts.form.errorExerciseNameRequired };
  }

  const parsedDate = new Date(0);
  const [year, month, day] = values.date.split("-").map(Number);
  parsedDate.setUTCFullYear(year, month - 1, day);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.date) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return { valid: false, error: texts.form.errorDateRequired };
  }

  return values.label === "strength"
    ? validateStrengthWorkoutForm(values, exercise.name)
    : validateRunningWorkoutForm(values, exercise.name);
};
