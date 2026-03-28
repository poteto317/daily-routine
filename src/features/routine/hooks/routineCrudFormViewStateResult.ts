import type { Routine } from "@/types/routine";
import type { Dispatch, SetStateAction } from "react";

type RoutineCrudFormViewStateResultArgs = {
  editingRoutine: Routine | undefined;
  setEditingRoutine: Dispatch<SetStateAction<Routine | undefined>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  showForm: boolean;
};

export const createRoutineCrudFormViewStateResult = ({
  editingRoutine,
  setEditingRoutine,
  setShowForm,
  showForm,
}: RoutineCrudFormViewStateResultArgs) => {
  return {
    editingRoutine,
    setEditingRoutine,
    setShowForm,
    showForm,
  };
};
