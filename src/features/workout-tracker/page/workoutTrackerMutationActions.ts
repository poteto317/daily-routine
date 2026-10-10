import type { WorkoutRecord } from "@/types/routine";
import { buildWorkoutRecordDeleteConfirmMessage } from "../workoutRecordConfirmMessages";
import {
  addWorkoutRecord,
  deleteWorkoutRecord,
  getWorkoutExercises,
} from "../storage";
import {
  validateWorkoutRecordForm,
  type WorkoutRecordFormValues,
} from "../workoutRecordFormValidation";

export type ConfirmDeleteWorkoutRecord = (message: string) => boolean;

type CreateAddWorkoutRecordHandlerParams = {
  resetForm: () => void;
  reload: () => void;
  setError: (error: string | null) => void;
};

/**
 * フォーム入力を検証し、有効なら永続化してフォームをリセット・一覧を再読込する。
 * 無効ならエラーメッセージを設定するだけで永続化は行わない。
 */
export const createAddWorkoutRecordHandler = ({
  resetForm,
  reload,
  setError,
}: CreateAddWorkoutRecordHandlerParams) => {
  return (values: WorkoutRecordFormValues) => {
    const result = validateWorkoutRecordForm(values, getWorkoutExercises());
    if (!result.valid) {
      setError(result.error);
      return;
    }

    try {
      addWorkoutRecord(result.record);
    } catch (error) {
      setError(error instanceof Error ? error.message : "");
      return;
    }
    setError(null);
    resetForm();
    reload();
  };
};

type CreateDeleteWorkoutRecordHandlerParams = {
  reload: () => void;
  confirmDelete: ConfirmDeleteWorkoutRecord;
  setError?: (error: string | null) => void;
};

/**
 * 確認が得られた場合のみ記録を削除し、一覧を再読込する。
 */
export const createDeleteWorkoutRecordHandler = ({
  reload,
  confirmDelete,
  setError,
}: CreateDeleteWorkoutRecordHandlerParams) => {
  return (record: WorkoutRecord) => {
    const message = buildWorkoutRecordDeleteConfirmMessage(record.exerciseName);
    if (!confirmDelete(message)) return;

    try {
      deleteWorkoutRecord(record.date, record.id);
    } catch (error) {
      setError?.(error instanceof Error ? error.message : "");
      return;
    }
    reload();
  };
};
