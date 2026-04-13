import { useMemo } from "react";
import type { Routine } from "@/types/routine";
import { resolveRoutineFormInitialState } from "./routineFormModel";

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

  return {
    initialState,
  };
};
