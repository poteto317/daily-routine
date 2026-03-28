import type { Routine } from "@/types/routine";
import type { useRoutineCrudActionHandlers } from "./useRoutineCrudActionHandlers";

type RoutineCrudResultArgs = {
  showForm: boolean;
  editingRoutine: Routine | undefined;
  closeForm: () => void;
  handlers: ReturnType<typeof useRoutineCrudActionHandlers>;
};

export const createRoutineCrudResult = ({
  showForm,
  editingRoutine,
  closeForm,
  handlers,
}: RoutineCrudResultArgs) => {
  return {
    showForm,
    editingRoutine,
    closeForm,
    ...handlers,
  };
};
