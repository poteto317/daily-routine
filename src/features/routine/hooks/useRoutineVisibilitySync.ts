import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import {
  refreshRoutineState,
  shouldRefreshOnVisibilityChange,
} from "./routineStateSync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineVisibilitySync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  useEffect(() => {
    if (!isLoaded) return;

    const handleVisibilityChange = () => {
      if (shouldRefreshOnVisibilityChange(document.visibilityState)) {
        refreshRoutineState(setRoutines);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, setRoutines]);
};
