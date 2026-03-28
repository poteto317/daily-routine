import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { useRoutinePageShowSync } from "./useRoutinePageShowSync";
import { useRoutineSavedSync } from "./useRoutineSavedSync";
import { useRoutineVisibilitySync } from "./useRoutineVisibilitySync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineStateSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  useRoutineVisibilitySync(isLoaded, setRoutines);
  useRoutinePageShowSync(isLoaded, setRoutines);
  useRoutineSavedSync(isLoaded, setRoutines);
};
