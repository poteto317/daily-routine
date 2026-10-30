import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";

type InitialWorkTrackerPageStateArgs = {
  sessions: WorkSession[];
  templates: WorkTemplate[];
};

/**
 * 画面の初期状態。戻り値型として宣言し、selectedMood・selectedTemplate を
 * as で広げずに検査する（as だと綴り違いの文字列も通ってしまうため）。
 */
type InitialWorkTrackerPageState = InitialWorkTrackerPageStateArgs & {
  isRunning: boolean;
  elapsedTime: number;
  showInputForm: boolean;
  showTemplateDropdown: boolean;
  workName: string;
  notes: string;
  selectedMood: MoodType;
  selectedTemplate: WorkTemplate | null;
};

export const createInitialWorkTrackerPageState = ({
  sessions,
  templates,
}: InitialWorkTrackerPageStateArgs): InitialWorkTrackerPageState => {
  return {
    sessions,
    templates,
    isRunning: false,
    elapsedTime: 0,
    showInputForm: false,
    showTemplateDropdown: false,
    workName: "",
    notes: "",
    selectedMood: "normal",
    selectedTemplate: null,
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
