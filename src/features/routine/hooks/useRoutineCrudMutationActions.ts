import { useMemo } from "react";
import {
  createRoutineMutationRunner,
  type SaveAndSyncAction,
  type SetRoutines,
} from "./routineMutationCoordinator";
import { useRoutineCrudMutations } from "./useRoutineCrudMutations";

export const useRoutineCrudMutationActions = (
  setRoutines: SetRoutines,
  saveAndSync: SaveAndSyncAction,
) => {
  const runAndSync = useMemo(
    () => createRoutineMutationRunner(setRoutines, saveAndSync),
    [setRoutines, saveAndSync],
  );

  return useRoutineCrudMutations(runAndSync);
};
