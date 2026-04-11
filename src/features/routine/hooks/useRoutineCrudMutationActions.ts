import { useMemo } from "react";
import type { Routine } from "@/types/routine";
import {
  createRoutineMutationRunner,
  type SaveAndSyncAction,
  type SetRoutines,
} from "./routineMutationCoordinator";
import { useRoutineCrudMutations } from "./useRoutineCrudMutations";

export const useRoutineCrudMutationActions = (
  setRoutines: SetRoutines,
  saveAndSync: SaveAndSyncAction,
  getRoutines: () => Routine[],
) => {
  const runAndSync = useMemo(
    () => createRoutineMutationRunner(setRoutines, saveAndSync, getRoutines),
    [setRoutines, saveAndSync, getRoutines],
  );

  return useRoutineCrudMutations(runAndSync);
};
