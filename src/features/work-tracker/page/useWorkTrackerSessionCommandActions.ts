import { useCallback } from "react";
import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";
import {
  createWorkTrackerCancelSessionHookHandler,
  createWorkTrackerDeleteSessionHookHandler,
  createWorkTrackerSaveSessionHookHandler,
} from "./workTrackerHookActions";
import { createWorkTrackerSessionCommandActionsResult } from "./workTrackerSessionCommandActionsResult";

type SetValue<T> = (value: T) => void;

type UseWorkTrackerSessionCommandActionsParams = {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  getStartTime: () => Date | null;
  setSessions: SetValue<WorkSession[]>;
  setTemplates: SetValue<WorkTemplate[]>;
  resetForm: () => void;
};

export const useWorkTrackerSessionCommandActions = ({
  elapsedTime,
  getStartTime,
  notes,
  resetForm,
  selectedMood,
  setSessions,
  setTemplates,
  workName,
}: UseWorkTrackerSessionCommandActionsParams) => {
  const handleSaveSession = useCallback(() => {
    createWorkTrackerSaveSessionHookHandler({
      workName,
      selectedMood,
      elapsedTime,
      notes,
      getStartTime,
      setSessions,
      setTemplates,
      resetForm,
    })();
  }, [
    elapsedTime,
    getStartTime,
    notes,
    resetForm,
    selectedMood,
    setSessions,
    setTemplates,
    workName,
  ]);

  const handleCancelSession = useCallback(() => {
    createWorkTrackerCancelSessionHookHandler(resetForm)();
  }, [resetForm]);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      createWorkTrackerDeleteSessionHookHandler({
        setSessions,
      })(sessionId);
    },
    [setSessions],
  );

  return createWorkTrackerSessionCommandActionsResult({
    handleCancelSession,
    handleDeleteSession,
    handleSaveSession,
  });
};
