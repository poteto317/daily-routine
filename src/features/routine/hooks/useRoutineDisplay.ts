import type { Routine, RoutineCategory } from "@/types/routine";
import { createRoutineDisplayResult } from "./routineDisplayResult";
import { useRoutineDisplayProgress } from "./useRoutineDisplayProgress";
import { useRoutineDisplayRoutines } from "./useRoutineDisplayRoutines";

interface RoutineDisplayParams {
  viewMode: "holiday" | number;
  filterCategory: RoutineCategory | "all";
  getHolidayRoutines: () => Routine[];
  getRoutinesByDayOfWeek: (day: number) => Routine[];
  getTodayRoutines: () => Routine[];
}

/** ルーティンのフィルタリング・ソート・進捗計算 */
export const useRoutineDisplay = ({
  viewMode,
  filterCategory,
  getHolidayRoutines,
  getRoutinesByDayOfWeek,
  getTodayRoutines,
}: RoutineDisplayParams) => {
  const { displayRoutines, sortedRoutines } = useRoutineDisplayRoutines({
    viewMode,
    filterCategory,
    getHolidayRoutines,
    getRoutinesByDayOfWeek,
  });
  const { todayRoutines, totalMinutes, completedMinutes, progressPercentage } =
    useRoutineDisplayProgress({ getTodayRoutines });

  return createRoutineDisplayResult({
    displayRoutines,
    todayRoutines,
    sortedRoutines,
    totalMinutes,
    completedMinutes,
    progressPercentage,
  });
};
