import type { MutableRefObject } from "react";
import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";
import {
  createWorkTrackerCancelSessionHandler,
  createWorkTrackerDeleteSessionHandler,
  createWorkTrackerResetFormAction,
  createWorkTrackerSaveSessionHandler,
  createWorkTrackerStartTimerAction,
  createWorkTrackerStopTimerAction,
} from "./workTrackerPageStateActions";

type SetValue<T> = (value: T) => void;

export const createWorkTrackerStartTimeRefActions = (
  startTimeRef: MutableRefObject<Date | null>,
) => {
  return {
    clearStartTime: () => {
      startTimeRef.current = null;
    },
    setStartTime: (date: Date) => {
      startTimeRef.current = date;
    },
    getStartTime: () => startTimeRef.current,
  };
};

export const createWorkTrackerResetFormHandler = (params: {
  setWorkName: SetValue<string>;
  setNotes: SetValue<string>;
  setSelectedMood: SetValue<MoodType>;
  setSelectedTemplate: SetValue<WorkTemplate | null>;
  setElapsedTime: SetValue<number>;
  setShowInputForm: SetValue<boolean>;
  setShowTemplateDropdown: SetValue<boolean>;
  clearStartTime: () => void;
}) => {
  return () => {
    createWorkTrackerResetFormAction(params)();
  };
};

export const createWorkTrackerStartTimerHandler = (params: {
  setElapsedTime: SetValue<number>;
  setIsRunning: SetValue<boolean>;
  setStartTime: (date: Date) => void;
}) => {
  return () => {
    createWorkTrackerStartTimerAction(params)();
  };
};

export const createWorkTrackerStopTimerHandler = (params: {
  setIsRunning: SetValue<boolean>;
  setShowInputForm: SetValue<boolean>;
}) => {
  return () => {
    createWorkTrackerStopTimerAction(params)();
  };
};

export const createWorkTrackerSaveSessionHookHandler = (params: {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  getStartTime: () => Date | null;
  setSessions: SetValue<WorkSession[]>;
  setTemplates: SetValue<WorkTemplate[]>;
  resetForm: () => void;
}) => {
  return () => {
    createWorkTrackerSaveSessionHandler(params)();
  };
};

export const createWorkTrackerCancelSessionHookHandler = (
  resetForm: () => void,
) => {
  return () => {
    createWorkTrackerCancelSessionHandler(resetForm)();
  };
};

export const createWorkTrackerDeleteSessionHookHandler = (params: {
  setSessions: SetValue<WorkSession[]>;
}) => {
  return (sessionId: string) => {
    createWorkTrackerDeleteSessionHandler(params)(sessionId);
  };
};
