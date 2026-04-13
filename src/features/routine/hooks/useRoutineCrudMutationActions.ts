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
  routinesRef: { current: Routine[] },
) => {
  const runAndSync = useMemo(
    () => createRoutineMutationRunner(setRoutines, saveAndSync, routinesRef),
    // routinesRef は安定した参照（useRef の戻り値）なので deps に含めても問題ない
    [setRoutines, saveAndSync, routinesRef],
  );

  return useRoutineCrudMutations(runAndSync);
};
