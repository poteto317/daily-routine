import { isHoliday } from "@/lib/holidays";
import {
  HOLIDAY_DAY_VALUE,
  type DailyHistory,
  type Routine,
} from "@/types/routine";

type RoutineSnapshot = DailyHistory["routineSnapshots"][number];

export const resolveHistoryDayValue = (date: Date): number => {
  return isHoliday(date) ? HOLIDAY_DAY_VALUE : date.getDay();
};

export const selectRoutinesForHistory = (
  routines: Routine[],
  date: Date,
): Routine[] => {
  const targetDayValue = resolveHistoryDayValue(date);
  return routines.filter((routine) => routine.daysOfWeek.includes(targetDayValue));
};

export const createRoutineSnapshots = (
  routines: Routine[],
): RoutineSnapshot[] => {
  return routines.map((routine) => ({
    id: routine.id,
    title: routine.title,
    category: routine.category,
    startTime: routine.startTime,
  }));
};

export const buildDailyHistoryEntry = (
  date: string,
  completedRoutineIds: string[],
  routines: Routine[],
): DailyHistory => {
  const todaysRoutines = selectRoutinesForHistory(routines, new Date(date));

  return {
    date,
    completedRoutineIds,
    routineSnapshots: createRoutineSnapshots(todaysRoutines),
  };
};
