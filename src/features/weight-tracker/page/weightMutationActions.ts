import type { Dispatch, SetStateAction } from "react";
import type { WeightHistory, WeightRecord } from "@/types/routine";
import { WEIGHT_TRACKER_MESSAGES } from "./helpers";
import { deleteWeightAndReload, saveWeightAndReload } from "./pageStateActions";
import { createLoadWeightDataAction } from "./weightReloadActions";

type WeightStateSetters = {
  setTodayRecord: Dispatch<SetStateAction<WeightRecord | null>>;
  setWeightInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setRecentRecords: Dispatch<SetStateAction<WeightRecord[]>>;
};

type WeightStorageReaders = {
  getTodayWeightRecord: () => WeightRecord | null;
  getWeightHistory: () => WeightHistory;
};

type CreateSaveHandlerArgs = WeightStorageReaders &
  WeightStateSetters & {
    today: string;
    weightInput: string;
    notesInput: string;
    saveWeight: (date: string, weight: number, notes?: string) => void;
  };

type CreateDeleteHandlerArgs = WeightStorageReaders &
  Pick<
    WeightStateSetters,
    "setTodayRecord" | "setWeightInput" | "setNotesInput" | "setRecentRecords"
  > & {
    deleteWeight: (date: string) => void;
  };

export const createSaveWeightHandler = ({
  today,
  weightInput,
  notesInput,
  saveWeight,
  getTodayWeightRecord,
  getWeightHistory,
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
  setRecentRecords,
}: CreateSaveHandlerArgs) => {
  const reloadData = createLoadWeightDataAction({
    getTodayWeightRecord,
    getWeightHistory,
    setTodayRecord,
    setWeightInput,
    setNotesInput,
    setRecentRecords,
  });

  return () => {
    saveWeightAndReload({
      today,
      weightInput,
      notesInput,
      alertMessage: WEIGHT_TRACKER_MESSAGES.alertInvalidWeight,
      saveWeight,
      reloadData,
      closeForm: () => setShowForm(false),
    });
  };
};

export const createDeleteWeightHandler = ({
  deleteWeight,
  getTodayWeightRecord,
  getWeightHistory,
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setRecentRecords,
}: CreateDeleteHandlerArgs) => {
  const reloadData = createLoadWeightDataAction({
    getTodayWeightRecord,
    getWeightHistory,
    setTodayRecord,
    setWeightInput,
    setNotesInput,
    setRecentRecords,
  });

  return (date: string) => {
    deleteWeightAndReload({
      date,
      confirmMessage: WEIGHT_TRACKER_MESSAGES.confirmDeleteTemplate(date),
      deleteWeight,
      reloadData,
    });
  };
};
