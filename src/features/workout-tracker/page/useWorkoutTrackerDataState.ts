import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
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

  useEffect(() => {
    window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(LOCAL_DATA_UPDATED_AT_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return { records, exercises, reload };
};
