import type {
  WorkoutRecordFormValues,
  WorkoutRecordFormValidation,
} from "./workoutRecordFormTypes";
import { toPositiveNumber } from "./workoutFormValueParsers";
import texts from "./locales/ja.json";

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
