import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { saveRoutines } from "@/features/routine/storage";
import { reorderRoutineState } from "./routineReorderActions";
import { stripCompletionState } from "./routineStateModel";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineReorderMutation = (
  setRoutines: SetRoutines,
  routinesRef: { current: Routine[] },
) => {
  return useCallback(
    (reorderedRoutines: Routine[]) => {
      const updated = reorderRoutineState(
        routinesRef.current,
        reorderedRoutines,
      );
      routinesRef.current = updated;
      setRoutines(updated);
      saveRoutines(stripCompletionState(updated));
    },
    [setRoutines, routinesRef],
  );
};
