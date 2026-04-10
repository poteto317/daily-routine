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
};

type ResolveInitialStateParams = {
  routine?: Routine;
  currentDayOfWeek?: number;
  existingRoutines: Routine[];
  defaultDurationMinutes: number;
  groupDaysOfWeek?: number[];
};

export const getGroupRoutines = (
  existingRoutines: Routine[],
  routine?: Routine,
): Routine[] => {
  if (!routine?.groupId) return [];
  return existingRoutines.filter((item) => item.groupId === routine.groupId);
};

export const getGroupDaysOfWeek = (groupRoutines: Routine[]): number[] => {
  return groupRoutines
    .map((item) => item.daysOfWeek[0])
    .filter((day): day is number => day !== undefined)
    .sort();
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
    groupDaysOfWeek,
  } = params;
  const initialDays = routine
    ? (groupDaysOfWeek && groupDaysOfWeek.length > 0
        ? groupDaysOfWeek
        : routine.daysOfWeek)
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
  };
};
