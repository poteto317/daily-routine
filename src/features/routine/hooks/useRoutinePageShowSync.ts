import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import {
  refreshRoutineState,
  shouldRefreshOnPageShow,
} from "./routineStateSync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutinePageShowSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  useEffect(() => {
    if (!isLoaded) return;

    const handlePageShow = (event: PageTransitionEvent) => {
      if (shouldRefreshOnPageShow(event.persisted, document.visibilityState)) {
        refreshRoutineState(setRoutines);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isLoaded, setRoutines]);
};
