import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { createRoutineCompletionMutationsResult } from "./routineCompletionMutationsResult";
import { useRoutineCompletionToggleMutation } from "./useRoutineCompletionToggleMutation";
import { useRoutineReorderMutation } from "./useRoutineReorderMutation";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineCompletionMutations = (
  setRoutines: SetRoutines,
  routinesRef: { current: Routine[] },
) => {
  const toggleComplete = useRoutineCompletionToggleMutation(
    setRoutines,
    routinesRef,
  );
  const reorderRoutines = useRoutineReorderMutation(setRoutines, routinesRef);

  return createRoutineCompletionMutationsResult({
    toggleComplete,
    reorderRoutines,
  });
};
