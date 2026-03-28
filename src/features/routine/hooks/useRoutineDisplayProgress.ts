import { calculateRoutineDisplayProgress } from "./routineDisplayActions";
import { Routine } from "@/types/routine";
import { createRoutineDisplayProgressResult } from "./routineDisplayProgressResult";

type UseRoutineDisplayProgressParams = {
  getTodayRoutines: () => Routine[];
};

export const useRoutineDisplayProgress = ({
  getTodayRoutines,
}: UseRoutineDisplayProgressParams) => {
  const todayRoutines = getTodayRoutines();
  const { totalMinutes, completedMinutes, progressPercentage } =
    calculateRoutineDisplayProgress(todayRoutines);

  return createRoutineDisplayProgressResult({
    todayRoutines,
    totalMinutes,
    completedMinutes,
    progressPercentage,
  });
};
