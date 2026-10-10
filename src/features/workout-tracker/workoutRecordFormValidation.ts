import type { WorkoutExercise } from "@/types/routine";
import type {
  WorkoutRecordFormValues,
  WorkoutRecordFormValidation,
} from "./workoutRecordFormTypes";
import { isWorkoutDate } from "./workoutFormValueParsers";
import { validateStrengthWorkoutForm } from "./validateStrengthWorkoutForm";
import { validateRunningWorkoutForm } from "./validateRunningWorkoutForm";
import texts from "./locales/ja.json";

export type {
  WorkoutRecordFormValues,
  WorkoutRecordFormValidation,
} from "./workoutRecordFormTypes";
export { validateStrengthWorkoutForm } from "./validateStrengthWorkoutForm";
export { validateRunningWorkoutForm } from "./validateRunningWorkoutForm";

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

  if (!isWorkoutDate(values.date)) {
    return { valid: false, error: texts.form.errorDateRequired };
  }

  return values.label === "strength"
    ? validateStrengthWorkoutForm(values, exercise.name)
    : validateRunningWorkoutForm(values, exercise.name);
};
