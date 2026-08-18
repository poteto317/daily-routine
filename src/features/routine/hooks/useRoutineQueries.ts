import { useCallback } from "react";
import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";
import {
  filterRoutinesByDayOfWeek,
  shouldShowRoutineToday,
} from "@/features/routine/storage";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";
import { createRoutineQueriesResult } from "./routineQueriesResult";
import type { RoutineQueryActions } from "./routineHookContract";

export const useRoutineQueries = (routines: Routine[]): RoutineQueryActions => {
  const getTodayRoutines = useCallback(() => {
    return routines.filter(shouldShowRoutineToday);
  }, [routines]);

  const getRoutinesByDayOfWeek = useCallback(
    (dayOfWeek: number) => {
      return filterRoutinesByDayOfWeek(routines, dayOfWeek);
    },
    [routines],
  );

  const getHolidayRoutines = useCallback(() => {
    return routines.filter((routine) => {
      return routine.daysOfWeek.includes(HOLIDAY_DAY_VALUE);
    });
  }, [routines]);

  const getIsTodayHoliday = useCallback((): boolean => {
    return isHoliday(getJstToday());
  }, []);

  return createRoutineQueriesResult({
    getTodayRoutines,
    getRoutinesByDayOfWeek,
    getHolidayRoutines,
    getIsTodayHoliday,
  });
};
