import type { Dispatch, SetStateAction } from "react";
import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type WorkTrackerPageActionBindingsArgs = {
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

export const createWorkTrackerPageActionBindings = ({
  workName,
  selectedMood,
  elapsedTime,
  notes,
  getStartTime,
  setSessions,
  setTemplates,
  setWorkName,
  setNotes,
  setSelectedMood,
  setSelectedTemplate,
  setElapsedTime,
  setShowInputForm,
  setShowTemplateDropdown,
  clearStartTime,
}: WorkTrackerPageActionBindingsArgs) => {
  return {
    workName,
    selectedMood,
    elapsedTime,
    notes,
    getStartTime,
    setSessions,
    setTemplates,
    setWorkName,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setElapsedTime,
    setShowInputForm,
    setShowTemplateDropdown,
    clearStartTime,
  };
};
