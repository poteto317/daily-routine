import type { MoodType, WorkSession, WorkTemplate } from "@/types/routine";
import {
  deleteWorkSession,
  getTodayWorkSessions,
  getWorkTemplates,
} from "@/lib/storage";
import { persistWorkSession } from "./sessionPersistence";
import { deleteTrackedSession, saveWorkTrackerSession } from "./stateActions";
import {
  createDeleteSessionConfirmation,
  createInvalidWorkNameHandler,
} from "./viewStateActions";
import { WORK_TRACKER_MESSAGES } from "./workTrackerPageText";

type SetValue<T> = (value: T) => void;

export const createWorkTrackerSaveSessionHandler = (params: {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  getStartTime: () => Date | null;
  setSessions: SetValue<WorkSession[]>;
  setTemplates: SetValue<WorkTemplate[]>;
  resetForm: () => void;
}) => {
  const {
    workName,
    selectedMood,
    elapsedTime,
    notes,
    getStartTime,
    setSessions,
    setTemplates,
    resetForm,
  } = params;

  return () => {
    saveWorkTrackerSession({
      workName,
      selectedMood,
      elapsedTime,
      notes,
      startTime: getStartTime(),
      onInvalidWorkName: createInvalidWorkNameHandler(
        WORK_TRACKER_MESSAGES.alertMissingTaskName,
      ),
      persistSession: persistWorkSession,
      refreshSessions: getTodayWorkSessions,
      refreshTemplates: getWorkTemplates,
      setSessions,
      setTemplates,
      resetForm,
    });
  };
};

export const createWorkTrackerCancelSessionHandler = (resetForm: () => void) => {
  return () => resetForm();
};

export const createWorkTrackerDeleteSessionHandler = (params: {
  setSessions: SetValue<WorkSession[]>;
}) => {
  const { setSessions } = params;

  return (sessionId: string) => {
    deleteTrackedSession({
      sessionId,
      confirmDelete: createDeleteSessionConfirmation(
        WORK_TRACKER_MESSAGES.confirmDeleteSession,
      ),
      removeSession: deleteWorkSession,
      refreshSessions: getTodayWorkSessions,
      setSessions,
    });
  };
};