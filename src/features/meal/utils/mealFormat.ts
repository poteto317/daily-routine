import { type MealRecord, type MealType } from "@/types/routine";
import { getCurrentTime, getTodayString } from "@/lib/storage/core";

export const getTodayDateString = (): string => getTodayString();

export const getCurrentTimeString = (): string => getCurrentTime();

export const formatMealDate = (dateStr: string): string => {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export const getMealTypeLabel = (mealType: MealType): string => {
  const labels: Record<MealType, string> = {
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "間食",
  };
  return labels[mealType];
};

export const getMealTypeIcon = (mealType: MealType): string => {
  const icons: Record<MealType, string> = {
    breakfast: "🌅",
    lunch: "🌞",
    dinner: "🌙",
    snack: "🍪",
  };
  return icons[mealType];
};

export const sortMealsByDateTimeDesc = (
  records: MealRecord[],
): MealRecord[] => {
  return records.slice().sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
};

export const sortMealsByTimeAsc = (records: MealRecord[]): MealRecord[] => {
  return records.slice().sort((a, b) => a.time.localeCompare(b.time));
};
