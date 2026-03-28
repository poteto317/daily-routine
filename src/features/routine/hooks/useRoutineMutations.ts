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
): RoutineMutationActions => {
  const crudMutations = useRoutineCrudMutationActions(setRoutines, saveAndSync);
  const completionMutations = useRoutineCompletionMutations(setRoutines);

  return createRoutineMutationsResult(crudMutations, completionMutations);
};
