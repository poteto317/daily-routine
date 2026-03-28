import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";

type WeightTrackerStateResultArgs = {
  today: string;
  todayRecord: WeightRecord | null;
  weightInput: string;
  notesInput: string;
  showForm: boolean;
  recentRecords: WeightRecord[];
  setWeightInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  handleSaveWeight: () => void;
  handleCancelForm: () => void;
  handleDeleteRecord: (date: string) => void;
};

export const createWeightTrackerStateResult = ({
  today,
  todayRecord,
  weightInput,
  notesInput,
  showForm,
  recentRecords,
  setWeightInput,
  setNotesInput,
  setShowForm,
  handleSaveWeight,
  handleCancelForm,
  handleDeleteRecord,
}: WeightTrackerStateResultArgs) => {
  return {
    today,
    todayRecord,
    weightInput,
    notesInput,
    showForm,
    recentRecords,
    setWeightInput,
    setNotesInput,
    setShowForm,
    handleSaveWeight,
    handleCancelForm,
    handleDeleteRecord,
  };
};
