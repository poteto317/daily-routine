import type { WorkoutLabel, WorkoutRecord } from "@/types/routine";
import type { WorkoutRecordFormValues } from "../workoutRecordFormValidation";
import type { WorkoutRecordDateGroup } from "../workoutRecordGrouping";

type CreateWorkoutTrackerPageStateResultParams = {
  formValues: WorkoutRecordFormValues;
  formError: string | null;
  groups: WorkoutRecordDateGroup[];
  setLabel: (label: WorkoutLabel) => void;
  setDate: (date: string) => void;
  setExerciseName: (exerciseName: string) => void;
  setWeightKg: (weightKg: string) => void;
  setReps: (reps: string) => void;
  setSets: (sets: string) => void;
  setCaloriesBurned: (caloriesBurned: string) => void;
  onSubmitAction: () => void;
  onDeleteRecordAction: (record: WorkoutRecord) => void;
};

/**
 * useWorkoutTrackerPageStateが公開する戻り値の形を組み立てる。
 */
export const createWorkoutTrackerPageStateResult = ({
  formValues,
  formError,
  groups,
  setLabel,
  setDate,
  setExerciseName,
  setWeightKg,
  setReps,
  setSets,
  setCaloriesBurned,
  onSubmitAction,
  onDeleteRecordAction,
}: CreateWorkoutTrackerPageStateResultParams) => {
  return {
    formValues,
    formError,
    groups,
    setLabel,
    setDate,
    setExerciseName,
    setWeightKg,
    setReps,
    setSets,
    setCaloriesBurned,
    onSubmitAction,
    onDeleteRecordAction,
  };
};
