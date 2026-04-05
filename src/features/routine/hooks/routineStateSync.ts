import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import {
  initializeRoutineState,
  resetRoutinesWhenDateChanged,
} from "./routineLifecycleState";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;
type ScheduleTask = (callback: () => void, delay: number) => unknown;

export const refreshRoutineState = (setRoutines: SetRoutines): void => {
  setRoutines((previous) => {
    const updated = resetRoutinesWhenDateChanged(previous);
    return updated ?? [...previous];
  });
};

export const shouldRefreshOnVisibilityChange = (
  visibilityState: DocumentVisibilityState,
): boolean => {
  return visibilityState === "visible";
};

export const reloadRoutinesFromStorage = (
  setRoutines: SetRoutines,
  scheduleTask: ScheduleTask = setTimeout,
): void => {
  scheduleTask(() => {
    setRoutines(initializeRoutineState());
  }, 0);
};
