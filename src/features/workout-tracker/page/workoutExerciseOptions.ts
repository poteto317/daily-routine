import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";

export const getWorkoutExerciseOptions = (
  exercises: WorkoutExercise[],
  label: WorkoutLabel,
): WorkoutExercise[] =>
  exercises.filter((exercise) => exercise.label === label);

export const getSelectedWorkoutExerciseId = (
  options: WorkoutExercise[],
  id: string,
): string => (options.some((exercise) => exercise.id === id) ? id : "");
