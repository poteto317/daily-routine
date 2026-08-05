import { useCallback } from "react";
import type { WorkoutRecord } from "@/types/routine";
import type { WorkoutRecordFormValues } from "../workoutRecordFormValidation";
import {
  createAddWorkoutRecordHandler,
  createDeleteWorkoutRecordHandler,
} from "./workoutTrackerMutationActions";

type UseWorkoutTrackerActionsParams = {
  reload: () => void;
  resetForm: () => void;
  setError: (error: string | null) => void;
};

/**
 * 運動記録の追加・削除操作をhookとして公開する。
 * バリデーション・確認ダイアログ・永続化・再読込の実処理はpure関数（workoutTrackerMutationActions）に委譲する。
 */
export const useWorkoutTrackerActions = ({
  reload,
  resetForm,
  setError,
}: UseWorkoutTrackerActionsParams) => {
  const handleAddRecord = useCallback(
    (values: WorkoutRecordFormValues) => {
      createAddWorkoutRecordHandler({ resetForm, reload, setError })(values);
    },
    [reload, resetForm, setError],
  );

  const handleDeleteRecord = useCallback(
    (record: WorkoutRecord) => {
      createDeleteWorkoutRecordHandler({
        reload,
        confirmDelete: (message) => window.confirm(message),
      })(record);
    },
    [reload],
  );

  return { handleAddRecord, handleDeleteRecord };
};
