import { useCallback } from "react";
import type { Routine } from "@/types/routine";
import {
  type RoutineBatchCreateInput,
  type RoutineCreateInput,
} from "./routineStateModel";
import {
  addRoutineToState,
  addRoutinesToState,
  deleteRoutineFromState,
  deleteRoutineGroupFromState,
  replaceRoutinesForDaysInState,
  updateRoutineInState,
} from "./routineCrudActions";

type RunAndSync = (mutate: (previous: Routine[]) => Routine[]) => void;

export const useRoutineCrudMutations = (runAndSync: RunAndSync) => {
  const addRoutine = useCallback(
    (routine: RoutineCreateInput) => {
      runAndSync((prev) => addRoutineToState(prev, routine));
    },
    [runAndSync],
  );

  const addRoutines = useCallback(
    (routines: RoutineBatchCreateInput[]) => {
      runAndSync((prev) => addRoutinesToState(prev, routines));
    },
    [runAndSync],
  );

  const updateRoutine = useCallback(
    (id: string, updates: Partial<Routine>) => {
      runAndSync((prev) => {
        const now = new Date().toISOString();
        return updateRoutineInState(prev, id, updates, now);
      });
    },
    [runAndSync],
  );

  const deleteRoutine = useCallback(
    (id: string) => {
      runAndSync((prev) => deleteRoutineFromState(prev, id));
    },
    [runAndSync],
  );

  const deleteRoutineGroup = useCallback(
    (groupId: string) => {
      runAndSync((prev) => deleteRoutineGroupFromState(prev, groupId));
    },
    [runAndSync],
  );

  /**
   * 指定曜日に属する既存ルーティンをすべて削除し、新しいルーティンを追加する（プリセット上書き適用用）
   */
  const replaceRoutinesForDays = useCallback(
    (targetDays: number[], newRoutineInputs: RoutineBatchCreateInput[]) => {
      runAndSync((prev) =>
        replaceRoutinesForDaysInState(prev, targetDays, newRoutineInputs),
      );
    },
    [runAndSync],
  );

  return {
    addRoutine,
    addRoutines,
    updateRoutine,
    deleteRoutine,
    deleteRoutineGroup,
    replaceRoutinesForDays,
  };
};
