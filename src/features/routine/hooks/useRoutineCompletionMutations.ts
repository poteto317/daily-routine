import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { createRoutineCompletionMutationsResult } from "./routineCompletionMutationsResult";
import { useRoutineCompletionToggleMutation } from "./useRoutineCompletionToggleMutation";
import { useRoutineReorderMutation } from "./useRoutineReorderMutation";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineCompletionMutations = (setRoutines: SetRoutines) => {
  const toggleComplete = useRoutineCompletionToggleMutation(setRoutines);
  const reorderRoutines = useRoutineReorderMutation(setRoutines);

  return createRoutineCompletionMutationsResult({
    toggleComplete,
    reorderRoutines,
  });
};
