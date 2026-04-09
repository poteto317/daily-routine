import type { WeightRecord } from "@/types/routine";
import { getWeightHistory } from "./storageData";

export const getWeightRecordsByPeriod = (
  startDate: string,
  endDate: string,
): WeightRecord[] => {
  const history = getWeightHistory();
  const records: WeightRecord[] = [];

  Object.keys(history).forEach((date) => {
    if (date >= startDate && date <= endDate) {
      records.push(history[date]);
    }
  });

  return records.sort((a, b) => a.date.localeCompare(b.date));
};

export const getLatestWeightRecord = (): WeightRecord | null => {
  const history = getWeightHistory();
  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) return null;

  return history[dates[0]];
};
