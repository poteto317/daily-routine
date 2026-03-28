import type { Dispatch, SetStateAction } from "react";
import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";

type WorkTrackerPageStateResultArgs = {
  sessions: WorkSession[];
  templates: WorkTemplate[];
  isRunning: boolean;
  elapsedTime: number;
  showInputForm: boolean;
  showTemplateDropdown: boolean;
  workName: string;
  notes: string;
  selectedMood: MoodType;
  selectedTemplate: WorkTemplate | null;
  setWorkName: Dispatch<SetStateAction<string>>;
  setNotes: Dispatch<SetStateAction<string>>;
  setSelectedMood: Dispatch<SetStateAction<MoodType>>;
  setSelectedTemplate: Dispatch<SetStateAction<WorkTemplate | null>>;
  setShowTemplateDropdown: Dispatch<SetStateAction<boolean>>;
  setShowInputForm: Dispatch<SetStateAction<boolean>>;
  startTimer: () => void;
  stopTimer: () => void;
  handleSaveSession: () => void;
  handleCancelSession: () => void;
  handleDeleteSession: (sessionId: string) => void;
};

export const createWorkTrackerPageStateResult = ({
  sessions,
  templates,
  isRunning,
  elapsedTime,
  showInputForm,
  showTemplateDropdown,
  workName,
  notes,
  selectedMood,
  selectedTemplate,
  setWorkName,
  setNotes,
  setSelectedMood,
  setSelectedTemplate,
  setShowTemplateDropdown,
  setShowInputForm,
  startTimer,
  stopTimer,
  handleSaveSession,
  handleCancelSession,
  handleDeleteSession,
}: WorkTrackerPageStateResultArgs) => {
  return {
    sessions,
    templates,
    isRunning,
    elapsedTime,
    showInputForm,
    showTemplateDropdown,
    workName,
    notes,
    selectedMood,
    selectedTemplate,
    setWorkName,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setShowTemplateDropdown,
    setShowInputForm,
    startTimer,
    stopTimer,
    handleSaveSession,
    handleCancelSession,
    handleDeleteSession,
  };
};
