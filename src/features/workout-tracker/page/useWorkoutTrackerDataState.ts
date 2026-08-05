import { useState } from "react";
import type { WorkoutRecord } from "@/types/routine";
import { getAllWorkoutRecords } from "../storage";

/**
 * 運動記録一覧の読み込み・stateを管理する。
 */
export const useWorkoutTrackerDataState = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>(() =>
    getAllWorkoutRecords(),
  );

  const reload = () => {
    setRecords(getAllWorkoutRecords());
  };

  return { records, reload };
};
