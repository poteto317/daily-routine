import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";
import { createWorkTrackerSessionActionsResult } from "./workTrackerSessionActionsResult";
import { useWorkTrackerSessionCommandActions } from "./useWorkTrackerSessionCommandActions";
import { useWorkTrackerSessionResetAction } from "./useWorkTrackerSessionResetAction";

type SetValue<T> = (value: T) => void;

type UseWorkTrackerSessionActionsParams = {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  getStartTime: () => Date | null;
  setSessions: SetValue<WorkSession[]>;
  setTemplates: SetValue<WorkTemplate[]>;
  setWorkName: SetValue<string>;
  setNotes: SetValue<string>;
  setSelectedMood: SetValue<MoodType>;
  setSelectedTemplate: SetValue<WorkTemplate | null>;
  setElapsedTime: SetValue<number>;
  setShowInputForm: SetValue<boolean>;
  setShowTemplateDropdown: SetValue<boolean>;
  clearStartTime: () => void;
};

export const useWorkTrackerSessionActions = ({
  clearStartTime,
  elapsedTime,
  getStartTime,
  notes,
  selectedMood,
  setElapsedTime,
  setNotes,
  setSelectedMood,
  setSelectedTemplate,
  setSessions,
  setShowInputForm,
  setShowTemplateDropdown,
  setTemplates,
  setWorkName,
  workName,
}: UseWorkTrackerSessionActionsParams) => {
  const resetForm = useWorkTrackerSessionResetAction({
    clearStartTime,
    setElapsedTime,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setShowInputForm,
    setShowTemplateDropdown,
    setWorkName,
  });
  const { handleCancelSession, handleDeleteSession, handleSaveSession } =
    useWorkTrackerSessionCommandActions({
      workName,
      selectedMood,
      elapsedTime,
      notes,
      getStartTime,
      setSessions,
      setTemplates,
      resetForm,
    });

  return createWorkTrackerSessionActionsResult({
    handleCancelSession,
    handleDeleteSession,
    handleSaveSession,
    resetForm,
  });
};
