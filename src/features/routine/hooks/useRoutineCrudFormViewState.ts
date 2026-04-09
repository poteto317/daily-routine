import { useState } from "react";
import { type Routine } from "@/types/routine";
import { createRoutineCrudFormViewStateResult } from "./routineCrudFormViewStateResult";

export const useRoutineCrudFormViewState = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | undefined>();

  return createRoutineCrudFormViewStateResult({
    editingRoutine,
    setEditingRoutine,
    setShowForm,
    showForm,
  });
};
