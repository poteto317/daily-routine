import type { Routine } from "@/types/routine";

type RoutineDisplayResultArgs = {
  displayRoutines: Routine[];
  todayRoutines: Routine[];
  sortedRoutines: Routine[];
  totalMinutes: number;
  completedMinutes: number;
  progressPercentage: number;
};

export const createRoutineDisplayResult = ({
  displayRoutines,
  todayRoutines,
  sortedRoutines,
  totalMinutes,
  completedMinutes,
  progressPercentage,
}: RoutineDisplayResultArgs) => {
  return {
    displayRoutines,
    todayRoutines,
    sortedRoutines,
    totalMinutes,
    completedMinutes,
    progressPercentage,
  };
};
