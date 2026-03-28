import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type WeightPageActionBindingsArgs = {
  today: string;
  weightInput: string;
  notesInput: string;
  setTodayRecord: SetValue<WeightRecord | null>;
  setWeightInput: SetValue<string>;
  setNotesInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setRecentRecords: SetValue<WeightRecord[]>;
};

export const createWeightPageActionBindings = ({
  today,
  weightInput,
  notesInput,
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
  setRecentRecords,
}: WeightPageActionBindingsArgs) => {
  return {
    today,
    weightInput,
    notesInput,
    setTodayRecord,
    setWeightInput,
    setNotesInput,
    setShowForm,
    setRecentRecords,
  };
};
