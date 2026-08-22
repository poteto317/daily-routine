import { useState } from "react";
import type { WeightRecord } from "@/types/routine";
import { getTodayWeightRecord, getWeightHistory } from "../storage";
import { getTodayDateKey } from "./weightRecordQueries";
import { createWeightPageData } from "./pageStateActions";

export const useWeightTrackerDataState = () => {
  const today = getTodayDateKey();
  const initialTodayRecord = getTodayWeightRecord();
  const initialPageData = createWeightPageData(
    initialTodayRecord,
    getWeightHistory(),
  );

  const [todayRecord, setTodayRecord] = useState<WeightRecord | null>(
    initialPageData.todayRecord,
  );
  const [recentRecords, setRecentRecords] = useState<WeightRecord[]>(
    initialPageData.recentRecords,
  );

  return {
    initialTodayRecord,
    recentRecords,
    setRecentRecords,
    setTodayRecord,
    today,
    todayRecord,
  };
};
