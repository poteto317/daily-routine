import type { WeightHistory, WeightRecord } from "@/types/routine";
import { getRecentWeightRecords } from "./weightRecordQueries";

type WeightPageData = {
  todayRecord: WeightRecord | null;
  recentRecords: WeightRecord[];
};

type WeightFormState = {
  weightInput: string;
  notesInput: string;
};

type SaveWeightArgs = {
  today: string;
  weightInput: string;
  notesInput: string;
  alertMessage: string;
  saveWeight: (date: string, weight: number, notes?: string) => void;
  reloadData: () => void;
  closeForm: () => void;
  alertFn?: (message?: string) => void;
};

type DeleteWeightArgs = {
  date: string;
  confirmMessage: string;
  deleteWeight: (date: string) => void;
  reloadData: () => void;
  confirmFn?: (message?: string) => boolean;
};

export const createWeightPageData = (
  todayRecord: WeightRecord | null,
  weightHistory: WeightHistory,
): WeightPageData => {
  return {
    todayRecord,
    recentRecords: getRecentWeightRecords(weightHistory),
  };
};

export const resetWeightFormInputs = (
  todayRecord: WeightRecord | null,
): WeightFormState => {
  if (!todayRecord) {
    return {
      weightInput: "",
      notesInput: "",
    };
  }

  return {
    weightInput: todayRecord.weight.toString(),
    notesInput: todayRecord.notes || "",
  };
};

export const saveWeightAndReload = ({
  today,
  weightInput,
  notesInput,
  alertMessage,
  saveWeight,
  reloadData,
  closeForm,
  alertFn = window.alert,
}: SaveWeightArgs): boolean => {
  const weight = parseFloat(weightInput);

  if (Number.isNaN(weight) || weight <= 0) {
    alertFn(alertMessage);
    return false;
  }

  const trimmedNotes = notesInput.trim();
  saveWeight(today, weight, trimmedNotes || undefined);
  reloadData();
  closeForm();
  return true;
};

export const deleteWeightAndReload = ({
  date,
  confirmMessage,
  deleteWeight,
  reloadData,
  confirmFn = window.confirm,
}: DeleteWeightArgs): boolean => {
  if (!confirmFn(confirmMessage)) {
    return false;
  }

  deleteWeight(date);
  reloadData();
  return true;
};

export type { WeightFormState, WeightPageData };
