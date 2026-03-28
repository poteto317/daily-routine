import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";
import { createWeightTrackerMutationActionsResult } from "./weightTrackerMutationActionsResult";
import {
  deleteWeightRecord,
  getTodayWeightRecord,
  getWeightHistory,
  saveWeightRecord,
} from "../storage";
import {
  createDeleteWeightHandler,
  createSaveWeightHandler,
} from "./weightPageStateActions";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseWeightTrackerMutationActionsParams = {
  today: string;
  weightInput: string;
  notesInput: string;
  setTodayRecord: SetValue<WeightRecord | null>;
  setWeightInput: SetValue<string>;
  setNotesInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setRecentRecords: SetValue<WeightRecord[]>;
};

export const useWeightTrackerMutationActions = ({
  today,
  weightInput,
  notesInput,
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
  setRecentRecords,
}: UseWeightTrackerMutationActionsParams) => {
  const handleSaveWeight = useCallback(() => {
    createSaveWeightHandler({
      today,
      weightInput,
      notesInput,
      saveWeight: saveWeightRecord,
      getTodayWeightRecord,
      getWeightHistory,
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
      setRecentRecords,
    })();
  }, [
    notesInput,
    setNotesInput,
    setRecentRecords,
    setShowForm,
    setTodayRecord,
    setWeightInput,
    today,
    weightInput,
  ]);

  const handleDeleteRecord = useCallback(
    (date: string) => {
      createDeleteWeightHandler({
        deleteWeight: deleteWeightRecord,
        getTodayWeightRecord,
        getWeightHistory,
        setTodayRecord,
        setWeightInput,
        setNotesInput,
        setRecentRecords,
      })(date);
    },
    [setNotesInput, setRecentRecords, setTodayRecord, setWeightInput],
  );

  return createWeightTrackerMutationActionsResult({
    handleDeleteRecord,
    handleSaveWeight,
  });
};
