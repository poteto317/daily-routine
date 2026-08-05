import type { WorkoutRecord } from "@/types/routine";
import texts from "./locales/ja.json";

/**
 * 運動記録1件の詳細部分（重量×回数×セット数、または消費カロリー）を
 * 表示用の文字列に組み立てる。
 */
export const formatWorkoutRecordSummary = (record: WorkoutRecord): string => {
  if (record.label === "strength") {
    const base = `${record.weightKg}${texts.historyItem.weightUnit} × ${record.reps}${texts.historyItem.repsUnit}`;
    return record.sets
      ? `${base} × ${record.sets}${texts.historyItem.setsUnit}`
      : base;
  }

  return `${record.caloriesBurned}${texts.historyItem.caloriesUnit}`;
};
