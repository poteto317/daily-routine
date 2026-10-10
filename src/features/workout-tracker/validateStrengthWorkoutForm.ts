import type {
  WorkoutRecordFormValues,
  WorkoutRecordFormValidation,
} from "./workoutRecordFormTypes";
import { toPositiveNumber } from "./workoutFormValueParsers";
import texts from "./locales/ja.json";

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
