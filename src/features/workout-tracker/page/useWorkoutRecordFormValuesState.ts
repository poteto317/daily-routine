import { useState } from "react";
import { getTodayString } from "@/lib/storage/core";
import type { WorkoutLabel } from "@/types/routine";
import type { WorkoutRecordFormValues } from "../workoutRecordFormValidation";

const createInitialValues = (): WorkoutRecordFormValues => ({
  label: "strength",
  date: getTodayString(),
  exerciseName: "",
  weightKg: "",
  reps: "",
  sets: "",
  caloriesBurned: "",
});

/**
 * 運動記録フォームの入力値のstateを管理する。
 */
export const useWorkoutRecordFormValuesState = () => {
  const [values, setValues] = useState<WorkoutRecordFormValues>(
    createInitialValues,
  );

  const setField = <K extends keyof WorkoutRecordFormValues>(
    key: K,
    value: WorkoutRecordFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const setLabel = (label: WorkoutLabel) => setField("label", label);
  const setDate = (date: string) => setField("date", date);
  const setExerciseName = (exerciseName: string) =>
    setField("exerciseName", exerciseName);
  const setWeightKg = (weightKg: string) => setField("weightKg", weightKg);
  const setReps = (reps: string) => setField("reps", reps);
  const setSets = (sets: string) => setField("sets", sets);
  const setCaloriesBurned = (caloriesBurned: string) =>
    setField("caloriesBurned", caloriesBurned);

  const resetValues = () => {
    setValues((prev) => ({ ...createInitialValues(), date: prev.date }));
  };

  return {
    values,
    setLabel,
    setDate,
    setExerciseName,
    setWeightKg,
    setReps,
    setSets,
    setCaloriesBurned,
    resetValues,
  };
};
