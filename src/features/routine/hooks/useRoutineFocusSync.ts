import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { refreshRoutineState } from "./routineStateSync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineFocusSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  useEffect(() => {
    if (!isLoaded) return;

    const handleFocus = () => {
      refreshRoutineState(setRoutines);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoaded, setRoutines]);
};
