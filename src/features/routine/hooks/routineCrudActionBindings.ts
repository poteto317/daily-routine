import type { RoutineCrudOps } from "../pages/types";
import type { Routine } from "@/types/routine";

type RoutineCrudActionBindingsArgs = {
  ops: RoutineCrudOps;
  editingRoutine: Routine | undefined;
  closeForm: () => void;
  openForm: (routine?: Routine) => void;
  restoreScroll: () => void;
};

export const createRoutineCrudActionBindings = ({
  ops,
  editingRoutine,
  closeForm,
  openForm,
  restoreScroll,
}: RoutineCrudActionBindingsArgs) => {
  return {
    ops,
    editingRoutine,
    closeForm,
    openForm,
    restoreScroll,
  };
};
