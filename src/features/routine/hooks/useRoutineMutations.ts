import type { Routine } from "@/types/routine";
import type { RoutineMutationActions } from "./routineHookContract";
import { createRoutineMutationsResult } from "./routineMutationsResult";
import {
  type SaveAndSyncAction,
  type SetRoutines,
} from "./routineMutationCoordinator";
import { useRoutineCompletionMutations } from "./useRoutineCompletionMutations";
import { useRoutineCrudMutationActions } from "./useRoutineCrudMutationActions";

export const useRoutineMutations = (
  setRoutines: SetRoutines,
  saveAndSync: SaveAndSyncAction,
  routinesRef: { current: Routine[] },
): RoutineMutationActions => {
  const crudMutations = useRoutineCrudMutationActions(
    setRoutines,
    saveAndSync,
    routinesRef,
  );
  const completionMutations = useRoutineCompletionMutations(
    setRoutines,
    routinesRef,
  );

  return createRoutineMutationsResult(crudMutations, completionMutations);
};
