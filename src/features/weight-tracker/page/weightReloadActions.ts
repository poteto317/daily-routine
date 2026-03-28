import type { Dispatch, SetStateAction } from "react";
import type { WeightHistory, WeightRecord } from "@/types/routine";
import { createWeightPageData, resetWeightFormInputs } from "./pageStateActions";

type WeightStateSetters = {
  setTodayRecord: Dispatch<SetStateAction<WeightRecord | null>>;
  setWeightInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
  setRecentRecords: Dispatch<SetStateAction<WeightRecord[]>>;
};

type WeightStorageReaders = {
  getTodayWeightRecord: () => WeightRecord | null;
  getWeightHistory: () => WeightHistory;
};

export const createLoadWeightDataAction = (
  args: WeightStorageReaders &
    Pick<
      WeightStateSetters,
      "setTodayRecord" | "setWeightInput" | "setNotesInput" | "setRecentRecords"
    >,
) => {
  const {
    getTodayWeightRecord,
    getWeightHistory,
    setTodayRecord,
    setWeightInput,
    setNotesInput,
    setRecentRecords,
  } = args;

  return () => {
    const record = getTodayWeightRecord();
    const pageData = createWeightPageData(record, getWeightHistory());
    const formState = resetWeightFormInputs(record);

    setTodayRecord(pageData.todayRecord);
    setWeightInput(formState.weightInput);
    setNotesInput(formState.notesInput);
    setRecentRecords(pageData.recentRecords);
  };
};