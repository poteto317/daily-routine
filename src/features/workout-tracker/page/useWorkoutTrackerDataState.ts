import { subscribeWorkoutStorage } from "./subscribeWorkoutStorage";
import { useCallback, useEffect, useState } from "react";
import type { WorkoutRecord, WorkoutExercise } from "@/types/routine";
import { getAllWorkoutRecords, getWorkoutExercises } from "../storage";

/**
 * 運動記録一覧の読み込み・stateを管理する。
 */
export const useWorkoutTrackerDataState = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>(() =>
    getAllWorkoutRecords(),
  );

  const [exercises, setExercises] =
    useState<WorkoutExercise[]>(getWorkoutExercises);

  const reload = useCallback(() => {
    setRecords(getAllWorkoutRecords());
    setExercises(getWorkoutExercises());
  }, []);

  useEffect(() => subscribeWorkoutStorage(reload), [reload]);

  return { records, exercises, reload };
};
