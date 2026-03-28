import type { Routine } from "@/types/routine";

type RoutineDisplayRoutinesResultArgs = {
  displayRoutines: Routine[];
  sortedRoutines: Routine[];
};

export const createRoutineDisplayRoutinesResult = ({
  displayRoutines,
  sortedRoutines,
}: RoutineDisplayRoutinesResultArgs) => {
  return {
    displayRoutines,
    sortedRoutines,
  };
};
