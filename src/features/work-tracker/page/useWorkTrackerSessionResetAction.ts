import { useCallback } from "react";
import type { MoodType, WorkTemplate } from "@/types/routine";
import { createWorkTrackerResetFormHandler } from "./workTrackerHookActions";

type SetValue<T> = (value: T) => void;

type UseWorkTrackerSessionResetActionParams = {
  setWorkName: SetValue<string>;
  setNotes: SetValue<string>;
  setSelectedMood: SetValue<MoodType>;
  setSelectedTemplate: SetValue<WorkTemplate | null>;
  setElapsedTime: SetValue<number>;
  setShowInputForm: SetValue<boolean>;
  setShowTemplateDropdown: SetValue<boolean>;
  clearStartTime: () => void;
};

export const useWorkTrackerSessionResetAction = ({
  clearStartTime,
  setElapsedTime,
  setNotes,
  setSelectedMood,
  setSelectedTemplate,
  setShowInputForm,
  setShowTemplateDropdown,
  setWorkName,
}: UseWorkTrackerSessionResetActionParams) => {
  return useCallback(() => {
    createWorkTrackerResetFormHandler({
      setWorkName,
      setNotes,
      setSelectedMood,
      setSelectedTemplate,
      setElapsedTime,
      setShowInputForm,
      setShowTemplateDropdown,
      clearStartTime,
    })();
  }, [
    clearStartTime,
    setElapsedTime,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setShowInputForm,
    setShowTemplateDropdown,
    setWorkName,
  ]);
};
