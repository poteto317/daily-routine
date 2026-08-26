import type { Routine } from "@/types/routine";
import type { RoutineMutationActions } from "./routineHookContract";
import { createRoutineMutationsResult } from "./routineMutationsResult";
import {
  type SaveAndSyncAction,
  type SetRoutines,
} from "./routineMutationCoordinator";
import { useRoutineCompletionToggleMutation } from "./useRoutineCompletionToggleMutation";
import { useRoutineCrudMutationActions } from "./useRoutineCrudMutationActions";
import { useRoutineReorderMutation } from "./useRoutineReorderMutation";

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
  const toggleComplete = useRoutineCompletionToggleMutation(
    setRoutines,
    routinesRef,
  );
  const reorderRoutines = useRoutineReorderMutation(setRoutines, routinesRef);

  return createRoutineMutationsResult({
    crudMutations,
    toggleComplete,
    reorderRoutines,
  });
};
