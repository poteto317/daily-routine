import type { MutableRefObject } from "react";
import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";

type SetValue<T> = (value: T) => void;

type PersistWorkSessionParams = {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  startTime: Date | null;
};

export const hasWorkNameInput = (workName: string): boolean => {
  return workName.trim().length > 0;
};

export const resetWorkTrackerForm = (params: {
  setWorkName: SetValue<string>;
  setNotes: SetValue<string>;
  setSelectedMood: SetValue<MoodType>;
  setSelectedTemplate: SetValue<WorkTemplate | null>;
  setElapsedTime: SetValue<number>;
  setShowInputForm: SetValue<boolean>;
  setShowTemplateDropdown: SetValue<boolean>;
  startTimeRef: MutableRefObject<Date | null>;
}): void => {
  const {
    setWorkName,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setElapsedTime,
    setShowInputForm,
    setShowTemplateDropdown,
    startTimeRef,
  } = params;

  setWorkName("");
  setNotes("");
  setSelectedMood("normal");
  setSelectedTemplate(null);
  setElapsedTime(0);
  setShowInputForm(false);
  setShowTemplateDropdown(false);
  startTimeRef.current = null;
};

export const startWorkTrackerTimer = (params: {
  setElapsedTime: SetValue<number>;
  setIsRunning: SetValue<boolean>;
  startTimeRef: MutableRefObject<Date | null>;
  now?: Date;
}): void => {
  const { setElapsedTime, setIsRunning, startTimeRef, now = new Date() } =
    params;

  startTimeRef.current = now;
  setElapsedTime(0);
  setIsRunning(true);
};

export const stopWorkTrackerTimer = (params: {
  setIsRunning: SetValue<boolean>;
  setShowInputForm: SetValue<boolean>;
}): void => {
  const { setIsRunning, setShowInputForm } = params;

  setIsRunning(false);
  setShowInputForm(true);
};

export const saveWorkTrackerSession = (params: {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  startTime: Date | null;
  onInvalidWorkName: () => void;
  persistSession: (params: PersistWorkSessionParams) => void;
  refreshSessions: () => WorkSession[];
  refreshTemplates: () => WorkTemplate[];
  setSessions: SetValue<WorkSession[]>;
  setTemplates: SetValue<WorkTemplate[]>;
  resetForm: () => void;
}): boolean => {
  const {
    workName,
    selectedMood,
    elapsedTime,
    notes,
    startTime,
    onInvalidWorkName,
    persistSession,
    refreshSessions,
    refreshTemplates,
    setSessions,
    setTemplates,
    resetForm,
  } = params;

  if (!hasWorkNameInput(workName)) {
    onInvalidWorkName();
    return false;
  }

  persistSession({
    workName,
    selectedMood,
    elapsedTime,
    notes,
    startTime,
  });
  setSessions(refreshSessions());
  setTemplates(refreshTemplates());
  resetForm();

  return true;
};

export const deleteTrackedSession = (params: {
  sessionId: string;
  confirmDelete: () => boolean;
  removeSession: (sessionId: string) => void;
  refreshSessions: () => WorkSession[];
  setSessions: SetValue<WorkSession[]>;
}): boolean => {
  const {
    sessionId,
    confirmDelete,
    removeSession,
    refreshSessions,
    setSessions,
  } = params;

  if (!confirmDelete()) {
    return false;
  }

  removeSession(sessionId);
  setSessions(refreshSessions());
  return true;
};
