import type { Routine } from "@/types/routine";

type RoutineDisplayProgressResultArgs = {
  completedMinutes: number;
  progressPercentage: number;
  todayRoutines: Routine[];
  totalMinutes: number;
};

export const createRoutineDisplayProgressResult = ({
  completedMinutes,
  progressPercentage,
  todayRoutines,
  totalMinutes,
}: RoutineDisplayProgressResultArgs) => {
  return {
    todayRoutines,
    totalMinutes,
    completedMinutes,
    progressPercentage,
  };
};
