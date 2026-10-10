import { useState } from "react";
import type {
  WorkoutExerciseActionContext,
  WorkoutExerciseActions,
} from "./workoutExerciseActionTypes";
import { createWorkoutExerciseMutationActions } from "./workoutExerciseMutationActions";

export const useWorkoutExerciseActions = (
  context: WorkoutExerciseActionContext,
): WorkoutExerciseActions => {
  const [error, setError] = useState<string | null>(null);
  const actions = createWorkoutExerciseMutationActions({
    ...context,
    setError,
    confirm: (message) => window.confirm(message),
  });
  return { ...actions, error };
};
