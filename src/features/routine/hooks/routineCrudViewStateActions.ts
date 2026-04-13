import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import type { RoutineCrudOps, RoutineData } from "../pages/types";
import { createRoutineSubmitPlan } from "./routineCrudPlan";

type SetBoolean = Dispatch<SetStateAction<boolean>>;
type SetRoutine = Dispatch<SetStateAction<Routine | undefined>>;

type HistoryLike = Pick<History, "pushState" | "back">;

export const saveRoutineCrudScrollPosition = (
  scrollRef: MutableRefObject<number>,
  scrollTop: number,
): void => {
  scrollRef.current = scrollTop;
};

export const restoreRoutineCrudScrollPosition = (params: {
  scrollRef: MutableRefObject<number>;
  scrollTo: (x: number, y: number) => void;
  schedule?: (callback: () => void, delay: number) => unknown;
}): void => {
  const { scrollRef, scrollTo, schedule = setTimeout } = params;

  schedule(() => scrollTo(0, scrollRef.current), 50);
};

export const closeRoutineCrudFormState = (params: {
  setShowForm: SetBoolean;
  setEditingRoutine: SetRoutine;
}): void => {
  const { setShowForm, setEditingRoutine } = params;

  setShowForm(false);
  setEditingRoutine(undefined);
};

export const openRoutineCrudFormState = (params: {
  isEditMode: boolean;
  routine?: Routine;
  scrollTop: number;
  scrollRef: MutableRefObject<number>;
  setEditingRoutine: SetRoutine;
  setShowForm: SetBoolean;
  history?: HistoryLike;
}): boolean => {
  const {
    isEditMode,
    routine,
    scrollTop,
    scrollRef,
    setEditingRoutine,
    setShowForm,
    history = window.history,
  } = params;

  if (!isEditMode) {
    return false;
  }

  saveRoutineCrudScrollPosition(scrollRef, scrollTop);
  setEditingRoutine(routine);
  setShowForm(true);
  history.pushState({ page: "form" }, "", "#form");
  return true;
};

export const applyRoutineSubmitPlan = (params: {
  editingRoutine?: Routine;
  routineData: RoutineData;
  ops: RoutineCrudOps;
}): void => {
  const { editingRoutine, routineData, ops } = params;
  const plan = createRoutineSubmitPlan(editingRoutine);

  switch (plan.type) {
    case "add-new":
      ops.addRoutine(routineData);
      return;
    case "update-single":
      ops.updateRoutine(plan.routineId, routineData);
      return;
    default: {
      const exhaustiveCheck: never = plan;
      return exhaustiveCheck;
    }
  }
};

export const finishRoutineCrudFormAction = (params: {
  closeForm: () => void;
  history?: HistoryLike;
  restoreScroll: () => void;
}): void => {
  const { closeForm, history = window.history, restoreScroll } = params;

  closeForm();
  history.back();
  restoreScroll();
};

export const deleteRoutineWithConfirmation = (params: {
  routine?: Routine;
  routines: Routine[];
  confirmDelete: (routine: Routine, allRoutines: Routine[]) => boolean;
  deleteRoutine: (id: string) => void;
  deleteRoutineGroup: (groupId: string) => void;
}): boolean => {
  const {
    routine,
    routines,
    confirmDelete,
    deleteRoutine,
    deleteRoutineGroup,
  } = params;

  if (!routine) {
    return false;
  }

  if (!confirmDelete(routine, routines)) {
    return false;
  }

  if (routine.groupId) {
    deleteRoutineGroup(routine.groupId);
    return true;
  }

  deleteRoutine(routine.id);
  return true;
};
