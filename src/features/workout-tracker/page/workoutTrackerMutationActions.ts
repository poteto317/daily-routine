import type { WorkoutRecord } from "@/types/routine";
import { buildWorkoutRecordDeleteConfirmMessage } from "../workoutRecordConfirmMessages";
import { addWorkoutRecord, deleteWorkoutRecord } from "../storage";
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
    const result = validateWorkoutRecordForm(values);
    if (!result.valid) {
      setError(result.error);
      return;
    }

    addWorkoutRecord(result.record);
    setError(null);
    resetForm();
    reload();
  };
};

type CreateDeleteWorkoutRecordHandlerParams = {
  reload: () => void;
  confirmDelete: ConfirmDeleteWorkoutRecord;
};

/**
 * 確認が得られた場合のみ記録を削除し、一覧を再読込する。
 */
export const createDeleteWorkoutRecordHandler = ({
  reload,
  confirmDelete,
}: CreateDeleteWorkoutRecordHandlerParams) => {
  return (record: WorkoutRecord) => {
    const message = buildWorkoutRecordDeleteConfirmMessage(record.exerciseName);
    if (!confirmDelete(message)) return;

    deleteWorkoutRecord(record.date, record.id);
    reload();
  };
};
