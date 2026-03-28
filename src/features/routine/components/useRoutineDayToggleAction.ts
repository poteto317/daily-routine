import { useCallback } from "react";
import { toggleDaySelection } from "./routineFormModel";

type UseRoutineDayToggleActionParams = {
  setDaysOfWeek: React.Dispatch<React.SetStateAction<number[]>>;
};

export const useRoutineDayToggleAction = ({
  setDaysOfWeek,
}: UseRoutineDayToggleActionParams) => {
  return useCallback(
    (day: number) => {
      setDaysOfWeek((prev) => toggleDaySelection(prev, day));
    },
    [setDaysOfWeek],
  );
};
