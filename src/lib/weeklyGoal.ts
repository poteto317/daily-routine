import type { WeeklyGoal } from "@/types/routine";

export const isValidWeeklyGoal = (value: unknown): value is WeeklyGoal => {
  if (!value || typeof value !== "object") return false;
  // 各フィールドは unknown のまま取り出し、下の検査で型を確かめる
  if (!("targetPerWeek" in value) || !("startedAt" in value)) return false;

  const { targetPerWeek, startedAt } = value;
  return (
    Number.isInteger(targetPerWeek) &&
    Number(targetPerWeek) >= 1 &&
    Number(targetPerWeek) <= 7 &&
    typeof startedAt === "string" &&
    Number.isFinite(Date.parse(startedAt))
  );
};
