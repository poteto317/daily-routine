import type { Routine, RoutineCategory } from "@/types/routine";
import { findNextAvailableTime } from "@/features/routine/storage";

export type RoutineFormState = {
  title: string;
  category: RoutineCategory;
  daysOfWeek: number[];
  startTime: string;
  duration: string;
  description: string;
  notificationMinutes: string;
  weeklyGoalTarget: string;
};

type ResolveInitialStateParams = {
  routine?: Routine;
  currentDayOfWeek?: number;
  existingRoutines: Routine[];
  defaultDurationMinutes: number;
};

export const toggleDaySelection = (days: number[], day: number): number[] => {
  return days.includes(day)
    ? days.filter((currentDay) => currentDay !== day)
    : [...days, day].sort();
};

export const resolveRoutineFormInitialState = (
  params: ResolveInitialStateParams,
): RoutineFormState => {
  const {
    routine,
    currentDayOfWeek,
    existingRoutines,
    defaultDurationMinutes,
  } = params;
  const initialDays = routine
    ? routine.daysOfWeek
    : currentDayOfWeek !== undefined
      ? [currentDayOfWeek]
      : [];
  const startTime = routine
    ? routine.startTime
    : findNextAvailableTime(
        existingRoutines,
        9 * 60,
        defaultDurationMinutes,
        initialDays,
      );

  return {
    title: routine?.title ?? "",
    category: routine?.category ?? "hobby",
    daysOfWeek: initialDays,
    startTime,
    duration:
      routine?.duration?.toString() ?? defaultDurationMinutes.toString(),
    description: routine?.description ?? "",
    notificationMinutes: routine?.notificationMinutes?.toString() ?? "",
    weeklyGoalTarget: routine?.weeklyGoal?.targetPerWeek?.toString() ?? "",
  };
};
