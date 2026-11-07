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
import { getTodayDateKey } from "./weightRecordQueries";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseWeightTrackerMutationActionsParams = {
  weightInput: string;
  notesInput: string;
  setTodayRecord: SetValue<WeightRecord | null>;
  setWeightInput: SetValue<string>;
  setNotesInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setRecentRecords: SetValue<WeightRecord[]>;
};

export const useWeightTrackerMutationActions = ({
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
      // 保存する日付は、保存を押した時点の今日で決める。描画時の今日をハンドラに持たせると、
      // フォームを開いたまま 0 時をまたいで再描画が無いまま保存したとき、前日で保存される
      today: getTodayDateKey(),
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
