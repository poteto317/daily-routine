import type { Dispatch, SetStateAction } from "react";
import type { MoodType, WorkTemplate } from "@/types/routine";

type WorkTrackerSessionFormStateResultArgs = {
  showInputForm: boolean;
  showTemplateDropdown: boolean;
  setShowInputForm: Dispatch<SetStateAction<boolean>>;
  setShowTemplateDropdown: Dispatch<SetStateAction<boolean>>;
  workName: string;
  notes: string;
  selectedMood: MoodType;
  selectedTemplate: WorkTemplate | null;
  setWorkName: Dispatch<SetStateAction<string>>;
  setNotes: Dispatch<SetStateAction<string>>;
  setSelectedMood: Dispatch<SetStateAction<MoodType>>;
  setSelectedTemplate: Dispatch<SetStateAction<WorkTemplate | null>>;
};

export const createWorkTrackerSessionFormStateResult = ({
  showInputForm,
  showTemplateDropdown,
  setShowInputForm,
  setShowTemplateDropdown,
  workName,
  notes,
  selectedMood,
  selectedTemplate,
  setWorkName,
  setNotes,
  setSelectedMood,
  setSelectedTemplate,
}: WorkTrackerSessionFormStateResultArgs) => {
  return {
    showInputForm,
    showTemplateDropdown,
    setShowInputForm,
    setShowTemplateDropdown,
    workName,
    notes,
    selectedMood,
    selectedTemplate,
    setWorkName,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
  };
};
