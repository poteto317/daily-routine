import type { Routine } from "@/types/routine";
import { minutesToTime, timeToMinutes } from "@/lib/storage/core";

const MINUTES_PER_DAY = 24 * 60;

export type RoutineReorderRange = {
  start: number;
  end: number;
};

export const assignSequentialStartTimes = (
  routines: Routine[],
  range: RoutineReorderRange,
  anchorStartTime: string,
): Routine[] | null => {
  const updatedRoutines = [...routines];
  let nextStartMinutes = timeToMinutes(anchorStartTime);

  for (let index = range.start; index <= range.end; index += 1) {
    if (nextStartMinutes >= MINUTES_PER_DAY) return null;

    const routine = routines[index];
    updatedRoutines[index] = {
      ...routine,
      startTime: minutesToTime(nextStartMinutes),
    };
    nextStartMinutes += routine.duration;
  }

  return updatedRoutines;
};
