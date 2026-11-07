import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";
import { createWeightTrackerActionsResult } from "./weightTrackerActionsResult";
import { useWeightTrackerMutationActions } from "./useWeightTrackerMutationActions";
import { useWeightTrackerReloadAction } from "./useWeightTrackerReloadAction";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseWeightTrackerActionsParams = {
  weightInput: string;
  notesInput: string;
  setTodayRecord: SetValue<WeightRecord | null>;
  setWeightInput: SetValue<string>;
  setNotesInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setRecentRecords: SetValue<WeightRecord[]>;
};

export const useWeightTrackerActions = ({
  weightInput,
  notesInput,
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
  setRecentRecords,
}: UseWeightTrackerActionsParams) => {
  const { reloadWeightData } = useWeightTrackerReloadAction({
    setTodayRecord,
    setWeightInput,
    setNotesInput,
    setRecentRecords,
  });
  const { handleDeleteRecord, handleSaveWeight } =
    useWeightTrackerMutationActions({
      weightInput,
      notesInput,
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
      setRecentRecords,
    });

  return createWeightTrackerActionsResult({
    handleDeleteRecord,
    handleSaveWeight,
    reloadWeightData,
  });
};
