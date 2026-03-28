import { useCallback } from "react";
import { Routine } from "@/types/routine";
import { RoutineData, RoutineCrudOps } from "../pages/types";
import { confirmDeleteRoutine } from "./deleteConfirm";
import {
  applyRoutineSubmitPlan,
  deleteRoutineWithConfirmation,
  finishRoutineCrudFormAction,
} from "./routineCrudViewStateActions";

type UseRoutineCrudActionHandlersParams = {
  ops: RoutineCrudOps;
  editingRoutine?: Routine;
  closeForm: () => void;
  openForm: (routine?: Routine) => void;
  restoreScroll: () => void;
};

export const useRoutineCrudActionHandlers = ({
  ops,
  editingRoutine,
  closeForm,
  openForm,
  restoreScroll,
}: UseRoutineCrudActionHandlersParams) => {
  const submitRoutineAction = useCallback(
    (routineData: RoutineData, originalGroupDays?: number[]) => {
      applyRoutineSubmitPlan({
        editingRoutine,
        routineData,
        originalGroupDays,
        ops,
      });

      finishRoutineCrudFormAction({
        closeForm,
        restoreScroll,
      });
    },
    [closeForm, editingRoutine, ops, restoreScroll],
  );

  const cancelRoutineAction = useCallback(() => {
    finishRoutineCrudFormAction({
      closeForm,
      restoreScroll,
    });
  }, [closeForm, restoreScroll]);

  const deleteRoutineAction = useCallback(
    (id: string) => {
      deleteRoutineWithConfirmation({
        routine: ops.routines.find((routine) => routine.id === id),
        routines: ops.routines,
        confirmDelete: confirmDeleteRoutine,
        deleteRoutine: ops.deleteRoutine,
        deleteRoutineGroup: ops.deleteRoutineGroup,
      });
    },
    [ops],
  );

  return {
    addRoutineAction: useCallback(() => openForm(), [openForm]),
    editRoutineAction: openForm,
    submitRoutineAction,
    cancelRoutineAction,
    deleteRoutineAction,
  };
};
