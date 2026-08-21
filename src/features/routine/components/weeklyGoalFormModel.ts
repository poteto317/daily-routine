import type { WeeklyGoal } from "@/types/routine";

const VALID_WEEKLY_GOAL_TARGET = /^[1-7]$/;

export const isWeeklyGoalTargetInputValid = (input: string): boolean =>
  input === "" || VALID_WEEKLY_GOAL_TARGET.test(input);

export const buildWeeklyGoal = (
  input: string,
  current: WeeklyGoal | undefined,
  now: string,
): WeeklyGoal | undefined => {
  if (input === "") return undefined;
  if (!isWeeklyGoalTargetInputValid(input)) return current;

  const targetPerWeek = Number(input);
  if (current?.targetPerWeek === targetPerWeek) return current;

  return { targetPerWeek, startedAt: now };
};
