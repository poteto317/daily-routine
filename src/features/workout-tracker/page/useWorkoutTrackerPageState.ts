import { useWorkoutExerciseActions } from "./useWorkoutExerciseActions";
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
  const { records, exercises, reload } = useWorkoutTrackerDataState();
  const {
    values,
    setLabel,
    setDate,
    setExerciseId,
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

  const exerciseActions = useWorkoutExerciseActions({
    label: values.label,
    selectedId: values.exerciseId,
    select: setExerciseId,
    reload,
  });

  const groups = groupWorkoutRecordsByDate(records);

  return {
    exercises,
    exerciseActions,
    ...createWorkoutTrackerPageStateResult({
      formValues: values,
      formError: error,
      groups,
      setLabel,
      setDate,
      setExerciseId,
      setWeightKg,
      setReps,
      setSets,
      setCaloriesBurned,
      onSubmitAction: () => handleAddRecord(values),
      onDeleteRecordAction: handleDeleteRecord,
    }),
  };
};
