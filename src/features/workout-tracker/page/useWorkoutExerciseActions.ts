import { useState } from "react";
import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";
import {
  addWorkoutExercise,
  renameWorkoutExercise,
  deleteWorkoutExercise,
} from "../storage";
import texts from "../locales/ja.json";

/** 保存に成功したときだけ一覧と選択を更新する。 */
export const useWorkoutExerciseActions = ({
  label,
  selectedId,
  select,
  reload,
}: {
  label: WorkoutLabel;
  selectedId: string;
  select: (id: string) => void;
  reload: () => void;
}) => {
  const [error, setError] = useState<string | null>(null);
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
      !window.confirm(
        texts.exercises.confirmDelete.replace("{name}", exercise.name),
      )
    )
      return false;
    return run(() => {
      deleteWorkoutExercise(exercise.id);
      if (selectedId === exercise.id) select("");
    });
  };
  return { add, rename, remove, error };
};
