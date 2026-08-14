import { type MealRecord } from "@/types/routine";
import { getMealHistory } from "./storageData";
import { getTodayString } from "@/lib/storage/core";

export const getMealRecordsByDate = (date: string): MealRecord[] => {
  return getMealHistory()[date] || [];
};

export const getTodayMealRecords = (): MealRecord[] => {
  const today = getTodayString();
  return getMealRecordsByDate(today);
};

export const getMealRecordsByPeriod = (
  startDate: string,
  endDate: string,
): MealRecord[] => {
  const records: MealRecord[] = [];
  Object.entries(getMealHistory()).forEach(([date, meals]) => {
    if (date >= startDate && date <= endDate) {
      records.push(...meals);
    }
  });
  return records.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
};
