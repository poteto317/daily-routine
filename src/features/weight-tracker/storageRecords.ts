import { WeightRecord } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import { getWeightHistory, saveWeightHistory } from "./storageData";

export const getWeightRecord = (date: string): WeightRecord | null => {
  const history = getWeightHistory();
  return history[date] || null;
};

export const getTodayWeightRecord = (): WeightRecord | null => {
  const today = new Date().toISOString().split("T")[0];
  return getWeightRecord(today);
};

export const saveWeightRecord = (
  date: string,
  weight: number,
  notes?: string,
): void => {
  const history = getWeightHistory();
  const now = new Date().toISOString();

  if (history[date]) {
    history[date] = {
      ...history[date],
      weight,
      notes,
      updatedAt: now,
    };
  } else {
    history[date] = {
      id: generateId("weight"),
      date,
      weight,
      notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  saveWeightHistory(history);
};

export const deleteWeightRecord = (date: string): void => {
  const history = getWeightHistory();
  delete history[date];
  saveWeightHistory(history);
};
