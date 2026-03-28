import type {
  RoutineMutationActions,
  RoutineQueryActions,
  RoutineScheduleActions,
  UseRoutinesResult,
} from "./routineHookContract";
import type { Routine } from "@/types/routine";

type UseRoutinesResultArgs = {
  isLoaded: boolean;
  mutations: RoutineMutationActions;
  queries: RoutineQueryActions;
  routines: Routine[];
  schedules: RoutineScheduleActions;
};

export const createUseRoutinesResult = ({
  isLoaded,
  mutations,
  queries,
  routines,
  schedules,
}: UseRoutinesResultArgs): UseRoutinesResult => {
  return {
    routines,
    isLoaded,
    ...mutations,
    ...queries,
    ...schedules,
  };
};
