import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { getTodayString } from "@/lib/storage/core";
import {
  getDailyProgress,
  saveDailyProgress,
} from "@/features/routine/storage";
import {
  buildDailyProgressForToggle,
  toggleRoutineCompletionInState,
} from "./routineCompletionActions";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

export const useRoutineCompletionToggleMutation = (
  setRoutines: SetRoutines,
) => {
  return useCallback(
    (id: string) => {
      setRoutines((prev) => {
        const updated = toggleRoutineCompletionInState(prev, id);

        saveDailyProgress(
          buildDailyProgressForToggle(
            updated,
            getTodayString(),
            getDailyProgress(),
          ),
        );

        return updated;
      });
    },
    [setRoutines],
  );
};
