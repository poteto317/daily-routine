import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { useRoutineForegroundSync } from "./useRoutineForegroundSync";
import { useRoutineSavedSync } from "./useRoutineSavedSync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineStateSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  useRoutineForegroundSync(isLoaded, setRoutines);
  useRoutineSavedSync(isLoaded, setRoutines);
};
