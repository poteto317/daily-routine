import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";
import { getTodayWeightRecord, getWeightHistory } from "../storage";
import { createLoadWeightDataAction } from "./weightPageStateActions";
import { createWeightTrackerReloadActionResult } from "./weightTrackerReloadActionResult";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseWeightTrackerReloadActionParams = {
  setTodayRecord: SetValue<WeightRecord | null>;
  setWeightInput: SetValue<string>;
  setNotesInput: SetValue<string>;
  setRecentRecords: SetValue<WeightRecord[]>;
};

export const useWeightTrackerReloadAction = ({
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setRecentRecords,
}: UseWeightTrackerReloadActionParams) => {
  const reloadWeightData = useCallback(() => {
    createLoadWeightDataAction({
      getTodayWeightRecord,
      getWeightHistory,
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setRecentRecords,
    })();
  }, [setNotesInput, setRecentRecords, setTodayRecord, setWeightInput]);

  return createWeightTrackerReloadActionResult({ reloadWeightData });
};
