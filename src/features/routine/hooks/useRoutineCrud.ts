import { type RoutineCrudOps } from "../pages/types";
import { createRoutineCrudActionBindings } from "./routineCrudActionBindings";
import { createRoutineCrudResult } from "./routineCrudResult";
import { useRoutineCrudActionHandlers } from "./useRoutineCrudActionHandlers";
import { useRoutineCrudFormState } from "./useRoutineCrudFormState";

/** ルーティンのCRUD操作ハンドラー */
export const useRoutineCrud = (ops: RoutineCrudOps, isEditMode: boolean) => {
  const { showForm, editingRoutine, closeForm, openForm, restoreScroll } =
    useRoutineCrudFormState({ isEditMode });
  const handlers = useRoutineCrudActionHandlers(
    createRoutineCrudActionBindings({
      ops,
      editingRoutine,
      closeForm,
      openForm,
      restoreScroll,
    }),
  );

  return createRoutineCrudResult({
    showForm,
    editingRoutine,
    closeForm,
    handlers,
  });
};
