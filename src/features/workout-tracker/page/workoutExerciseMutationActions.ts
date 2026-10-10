import type { WorkoutExercise } from "@/types/routine";
import type {
  WorkoutExerciseActionContext,
  WorkoutExerciseActions,
} from "./workoutExerciseActionTypes";
import {
  addWorkoutExercise,
  renameWorkoutExercise,
  deleteWorkoutExercise,
} from "../storage";
import texts from "../locales/ja.json";

/** 保存成功後に選択と一覧を更新する操作を組み立てる。 */
export const createWorkoutExerciseMutationActions = ({
  label,
  selectedId,
  select,
  reload,
  setError,
  confirm,
}: WorkoutExerciseActionContext & {
  setError: (error: string | null) => void;
  confirm: (message: string) => boolean;
}): Omit<WorkoutExerciseActions, "error"> => {
  const run = (action: () => void): boolean => {
    try {
      action();
      setError(null);
      reload();
      return true;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : texts.exercises.saveFailed,
      );
      return false;
    }
  };
  const add = (name: string) =>
    run(() => select(addWorkoutExercise({ name, label }).id));
  const rename = (id: string, name: string) =>
    run(() => {
      renameWorkoutExercise(id, name);
    });
  const remove = (exercise: WorkoutExercise) => {
    if (
      !confirm(texts.exercises.confirmDelete.replace("{name}", exercise.name))
    )
      return false;
    return run(() => {
      deleteWorkoutExercise(exercise.id);
      if (selectedId === exercise.id) select("");
    });
  };
  return { add, rename, remove };
};
