import { useMemo } from "react";
import type { Routine } from "@/types/routine";
import {
  getGroupDaysOfWeek,
  getGroupRoutines,
  resolveRoutineFormInitialState,
} from "./routineFormModel";

type UseRoutineFormDerivedContextParams = {
  currentDayOfWeek?: number;
  defaultDurationMinutes: number;
  existingRoutines: Routine[];
  routine?: Routine;
};

export const useRoutineFormDerivedContext = ({
  currentDayOfWeek,
  defaultDurationMinutes,
  existingRoutines,
  routine,
}: UseRoutineFormDerivedContextParams) => {
  const initialState = useMemo(
    () =>
      resolveRoutineFormInitialState({
        routine,
        currentDayOfWeek,
        existingRoutines,
        defaultDurationMinutes,
      }),
    [routine, currentDayOfWeek, existingRoutines, defaultDurationMinutes],
  );

  const groupDaysOfWeek = useMemo(() => {
    return getGroupDaysOfWeek(getGroupRoutines(existingRoutines, routine));
  }, [existingRoutines, routine]);

  return {
    groupDaysOfWeek,
    initialState,
  };
};
