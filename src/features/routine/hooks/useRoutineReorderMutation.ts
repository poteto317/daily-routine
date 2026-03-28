import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { saveRoutines } from "@/features/routine/storage";
import { reorderRoutineState } from "./routineCompletionActions";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineReorderMutation = (setRoutines: SetRoutines) => {
  return useCallback(
    (reorderedRoutines: Routine[]) => {
      const updated = reorderRoutineState(reorderedRoutines);
      setRoutines(updated);
      saveRoutines(updated);
    },
    [setRoutines],
  );
};
