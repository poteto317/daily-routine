import type { WeightHistory, WeightRecord } from "@/types/routine";
import { getTodayString } from "@/lib/storage/core";

export const getTodayDateKey = (): string => getTodayString();

export const formatWeightDate = (dateStr: string): string =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

export const calculateWeightChange = (
  currentWeight: number,
  previousWeight: number,
): number => currentWeight - previousWeight;

export const getRecentWeightRecords = (
  history: WeightHistory,
  limit = 30,
): WeightRecord[] =>
  Object.values(history)
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
