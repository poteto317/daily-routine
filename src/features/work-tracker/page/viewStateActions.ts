import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";

type InitialWorkTrackerPageStateArgs = {
  sessions: WorkSession[];
  templates: WorkTemplate[];
};

export const createInitialWorkTrackerPageState = ({
  sessions,
  templates,
}: InitialWorkTrackerPageStateArgs) => {
  return {
    sessions,
    templates,
    isRunning: false,
    elapsedTime: 0,
    showInputForm: false,
    showTemplateDropdown: false,
    workName: "",
    notes: "",
    selectedMood: "normal" as MoodType,
    selectedTemplate: null as WorkTemplate | null,
  };
};

export const createInvalidWorkNameHandler = (
  message: string,
  alertFn: (message?: string) => void = window.alert,
) => {
  return () => {
    alertFn(message);
  };
};

export const createDeleteSessionConfirmation = (
  message: string,
  confirmFn: (message?: string) => boolean = window.confirm,
) => {
  return () => confirmFn(message);
};
