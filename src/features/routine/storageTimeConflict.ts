import type { Routine } from "@/types/routine";
import { minutesToTime, timeToMinutes } from "@/lib/storage/core";

export const hasTimeConflict = (
  startTime: string,
  duration: number,
  existingRoutines: Routine[],
  currentRoutineId?: string,
  daysOfWeek?: number[],
): {
  hasConflict: boolean;
  conflictingRoutines: Array<{ routine: Routine; commonDays: number[] }>;
} => {
  const newStart = timeToMinutes(startTime);
  const newEnd = newStart + duration;
  const conflictingRoutines: Array<{ routine: Routine; commonDays: number[] }> =
    [];

  existingRoutines.forEach((routine) => {
    if (currentRoutineId && routine.id === currentRoutineId) return;

    let commonDays: number[] = [];
    if (daysOfWeek && daysOfWeek.length > 0) {
      commonDays = routine.daysOfWeek.filter((day) => daysOfWeek.includes(day));
      if (commonDays.length === 0) return;
    } else {
      return;
    }

    const existingStart = timeToMinutes(routine.startTime);
    const existingEnd = existingStart + routine.duration;

    if (newStart < existingEnd && newEnd > existingStart) {
      conflictingRoutines.push({ routine, commonDays });
    }
  });

  return {
    hasConflict: conflictingRoutines.length > 0,
    conflictingRoutines,
  };
};

export const findNextAvailableTime = (
  routines: Routine[],
  preferredStartMinutes: number = 9 * 60,
  defaultDuration: number = 30,
  daysOfWeek?: number[],
): string => {
  if (routines.length === 0 || !daysOfWeek || daysOfWeek.length === 0)
    return minutesToTime(preferredStartMinutes);

  const filteredRoutines = routines.filter((routine) => {
    return routine.daysOfWeek.some((day) => daysOfWeek.includes(day));
  });

  if (filteredRoutines.length === 0)
    return minutesToTime(preferredStartMinutes);

  const endTimes = filteredRoutines
    .map((routine) => ({
      start: timeToMinutes(routine.startTime),
      end: timeToMinutes(routine.startTime) + routine.duration,
    }))
    .sort((a, b) => a.start - b.start);

  const preferredEnd = preferredStartMinutes + defaultDuration;
  const hasConflictWithPreferred = endTimes.some((slot) => {
    return preferredStartMinutes < slot.end && preferredEnd > slot.start;
  });

  if (!hasConflictWithPreferred) return minutesToTime(preferredStartMinutes);

  let latestEnd = 0;
  for (const slot of endTimes) {
    if (
      slot.start >= preferredStartMinutes &&
      slot.start - latestEnd >= defaultDuration &&
      latestEnd >= preferredStartMinutes
    )
      return minutesToTime(latestEnd);
    latestEnd = Math.max(latestEnd, slot.end);
  }

  return minutesToTime(latestEnd);
};
