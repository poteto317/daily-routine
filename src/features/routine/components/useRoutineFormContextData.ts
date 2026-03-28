import type { Routine } from "@/types/routine";
import { useRoutineFormDerivedContext } from "./useRoutineFormDerivedContext";
import { useRoutineFormSourceData } from "./useRoutineFormSourceData";

type UseRoutineFormContextDataParams = {
  routine?: Routine;
  currentDayOfWeek?: number;
};

export const useRoutineFormContextData = ({
  routine,
  currentDayOfWeek,
}: UseRoutineFormContextDataParams) => {
  const sourceData = useRoutineFormSourceData();
  const derivedContext = useRoutineFormDerivedContext({
    currentDayOfWeek,
    defaultDurationMinutes: sourceData.defaultDurationMinutes,
    existingRoutines: sourceData.existingRoutines,
    routine,
  });

  return {
    ...sourceData,
    ...derivedContext,
  };
};
