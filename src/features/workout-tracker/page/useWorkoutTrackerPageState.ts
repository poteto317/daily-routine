import { groupWorkoutRecordsByDate } from "../workoutRecordGrouping";
import { useWorkoutRecordFormError } from "./useWorkoutRecordFormError";
import { useWorkoutRecordFormValuesState } from "./useWorkoutRecordFormValuesState";
import { useWorkoutTrackerActions } from "./useWorkoutTrackerActions";
import { useWorkoutTrackerDataState } from "./useWorkoutTrackerDataState";
import { createWorkoutTrackerPageStateResult } from "./workoutTrackerPageStateResult";

/**
 * 運動記録ページの合成ルートhook。データ・フォーム・操作を束ねる。
 */
export const useWorkoutTrackerPageState = () => {
  const { records, reload } = useWorkoutTrackerDataState();
  const {
    values,
    setLabel,
    setDate,
    setExerciseName,
    setWeightKg,
    setReps,
    setSets,
    setCaloriesBurned,
    resetValues,
  } = useWorkoutRecordFormValuesState();
  const { error, setError } = useWorkoutRecordFormError();
  const { handleAddRecord, handleDeleteRecord } = useWorkoutTrackerActions({
    reload,
    resetForm: resetValues,
    setError,
  });

  const groups = groupWorkoutRecordsByDate(records);

  return createWorkoutTrackerPageStateResult({
    formValues: values,
    formError: error,
    groups,
    setLabel,
    setDate,
    setExerciseName,
    setWeightKg,
    setReps,
    setSets,
    setCaloriesBurned,
    onSubmitAction: () => handleAddRecord(values),
    onDeleteRecordAction: handleDeleteRecord,
  });
};
