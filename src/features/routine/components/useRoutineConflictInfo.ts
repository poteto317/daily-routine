import { useMemo } from "react";
import type { Routine } from "@/types/routine";
import { hasTimeConflict } from "@/features/routine/storage";
import { parseDurationOrDefault } from "./routineFormModel";

type UseRoutineConflictInfoParams = {
  startTime: string;
  duration: string;
  defaultDurationMinutes: number;
  existingRoutines: Routine[];
  routineId?: string;
  daysOfWeek: number[];
};

export const useRoutineConflictInfo = ({
  startTime,
  duration,
  defaultDurationMinutes,
  existingRoutines,
  routineId,
  daysOfWeek,
}: UseRoutineConflictInfoParams) => {
  return useMemo(() => {
    return hasTimeConflict(
      startTime,
      parseDurationOrDefault(duration, defaultDurationMinutes),
      existingRoutines,
      routineId,
      daysOfWeek,
    );
  }, [
    startTime,
    duration,
    defaultDurationMinutes,
    existingRoutines,
    routineId,
    daysOfWeek,
  ]);
};
