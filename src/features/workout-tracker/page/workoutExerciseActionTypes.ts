import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";

export interface WorkoutExerciseActions {
  add: (name: string) => boolean;
  rename: (id: string, name: string) => boolean;
  remove: (exercise: WorkoutExercise) => boolean;
  error: string | null;
}

export interface WorkoutExerciseActionContext {
  label: WorkoutLabel;
  selectedId: string;
  select: (id: string) => void;
  reload: () => void;
}
