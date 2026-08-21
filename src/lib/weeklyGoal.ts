import type { WeeklyGoal } from "@/types/routine";

export const isValidWeeklyGoal = (value: unknown): value is WeeklyGoal => {
  if (!value || typeof value !== "object") return false;

  const weeklyGoal = value as Partial<WeeklyGoal>;
  return (
    Number.isInteger(weeklyGoal.targetPerWeek) &&
    Number(weeklyGoal.targetPerWeek) >= 1 &&
    Number(weeklyGoal.targetPerWeek) <= 7 &&
    typeof weeklyGoal.startedAt === "string" &&
    Number.isFinite(Date.parse(weeklyGoal.startedAt))
  );
};
