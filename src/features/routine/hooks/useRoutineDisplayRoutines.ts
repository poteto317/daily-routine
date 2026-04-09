import { useMemo } from "react";
import { type Routine, type RoutineCategory } from "@/types/routine";
import {
  filterRoutineDisplayByCategory,
  getDisplayRoutinesForViewMode,
  sortDisplayRoutinesForList,
} from "./routineDisplayActions";
import { createRoutineDisplayRoutinesResult } from "./routineDisplayRoutinesResult";

type UseRoutineDisplayRoutinesParams = {
  viewMode: "holiday" | number;
  filterCategory: RoutineCategory | "all";
  getHolidayRoutines: () => Routine[];
  getRoutinesByDayOfWeek: (day: number) => Routine[];
};

export const useRoutineDisplayRoutines = ({
  viewMode,
  filterCategory,
  getHolidayRoutines,
  getRoutinesByDayOfWeek,
}: UseRoutineDisplayRoutinesParams) => {
  const displayRoutines = useMemo(() => {
    return getDisplayRoutinesForViewMode({
      viewMode,
      getHolidayRoutines,
      getRoutinesByDayOfWeek,
    });
  }, [viewMode, getHolidayRoutines, getRoutinesByDayOfWeek]);

  const filteredRoutines = filterRoutineDisplayByCategory(
    displayRoutines,
    filterCategory,
  );
  const sortedRoutines = sortDisplayRoutinesForList(filteredRoutines);

  return createRoutineDisplayRoutinesResult({
    displayRoutines,
    sortedRoutines,
  });
};
