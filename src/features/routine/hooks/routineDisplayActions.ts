import type { Routine, RoutineCategory } from "@/types/routine";

type RoutineCollectionArgs = {
  viewMode: "holiday" | number;
  getHolidayRoutines: () => Routine[];
  getRoutinesByDayOfWeek: (day: number) => Routine[];
};

export const getDisplayRoutinesForViewMode = ({
  viewMode,
  getHolidayRoutines,
  getRoutinesByDayOfWeek,
}: RoutineCollectionArgs): Routine[] => {
  const baseRoutines =
    viewMode === "holiday"
      ? getHolidayRoutines()
      : getRoutinesByDayOfWeek(viewMode);

  return [...baseRoutines].sort((left, right) =>
    left.startTime.localeCompare(right.startTime),
  );
};

export const filterRoutineDisplayByCategory = (
  routines: Routine[],
  filterCategory: RoutineCategory | "all",
): Routine[] => {
  return filterCategory === "all"
    ? routines
    : routines.filter((routine) => routine.category === filterCategory);
};

export const sortDisplayRoutinesForList = (routines: Routine[]): Routine[] => {
  return [...routines].sort((left, right) => {
    if (left.isCompleted !== right.isCompleted) {
      return left.isCompleted ? 1 : -1;
    }

    return left.startTime.localeCompare(right.startTime);
  });
};

export const calculateRoutineDisplayProgress = (todayRoutines: Routine[]) => {
  const totalMinutes = todayRoutines.reduce(
    (sum, routine) => sum + routine.duration,
    0,
  );
  const completedMinutes = todayRoutines
    .filter((routine) => routine.isCompleted)
    .reduce((sum, routine) => sum + routine.duration, 0);

  return {
    totalMinutes,
    completedMinutes,
    progressPercentage:
      totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0,
  };
};
