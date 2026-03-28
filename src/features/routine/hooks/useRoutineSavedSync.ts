import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { ROUTINES_SAVED_EVENT } from "./routinePersistenceSync";
import { reloadRoutinesFromStorage } from "./routineStateSync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineSavedSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  useEffect(() => {
    if (!isLoaded) return;

    const handleRoutinesSaved = () => {
      reloadRoutinesFromStorage(setRoutines);
    };

    window.addEventListener(ROUTINES_SAVED_EVENT, handleRoutinesSaved);

    return () => {
      window.removeEventListener(ROUTINES_SAVED_EVENT, handleRoutinesSaved);
    };
  }, [isLoaded, setRoutines]);
};
