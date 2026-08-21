import type { Routine } from "@/types/routine";
import type { RoutineData } from "../pages/types";
import type { RoutineFormState } from "./routineFormInitialModel";
import { buildWeeklyGoal } from "./weeklyGoalFormModel";

type BuildSubmitPayloadParams = {
  routine?: Routine;
  state: RoutineFormState;
  defaultDurationMinutes: number;
  now?: string;
};

export const parseDurationOrDefault = (
  duration: string,
  defaultDurationMinutes: number,
): number => {
  const parsed = Number.parseInt(duration, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : defaultDurationMinutes;
};

export const parseNotificationMinutes = (
  notificationMinutes: string,
): number | undefined => {
  if (!notificationMinutes) return undefined;

  const parsed = Number.parseInt(notificationMinutes, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const buildRoutineSubmitPayload = ({
  routine,
  state,
  defaultDurationMinutes,
  now = new Date().toISOString(),
}: BuildSubmitPayloadParams): {
  routineData: RoutineData;
} => {
  const routineData: RoutineData = {
    title: state.title,
    category: state.category,
    daysOfWeek: state.daysOfWeek,
    startTime: state.startTime,
    duration: parseDurationOrDefault(state.duration, defaultDurationMinutes),
    description: state.description || undefined,
    notificationMinutes: parseNotificationMinutes(state.notificationMinutes),
    isCompleted: routine?.isCompleted || false,
    sortOrder: routine?.sortOrder ?? 0,
    groupId: routine?.groupId,
    weeklyGoal: buildWeeklyGoal(
      state.weeklyGoalTarget,
      routine?.weeklyGoal,
      now,
    ),
  };

  return { routineData };
};
