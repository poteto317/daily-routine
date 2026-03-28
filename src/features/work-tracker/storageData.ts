import { WorkSessionHistory, WorkTemplate } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import {
  STORAGE_KEY_WORK_SESSIONS,
  STORAGE_KEY_WORK_TEMPLATES,
} from "./storageKeys";

export const getWorkTemplates = (): WorkTemplate[] => {
  return getStorageItem<WorkTemplate[]>(STORAGE_KEY_WORK_TEMPLATES, []);
};

export const saveWorkTemplates = (templates: WorkTemplate[]): void => {
  setStorageItem(STORAGE_KEY_WORK_TEMPLATES, templates);
};

export const getWorkSessionHistory = (): WorkSessionHistory => {
  return getStorageItem<WorkSessionHistory>(STORAGE_KEY_WORK_SESSIONS, {});
};

export const saveWorkSessionHistory = (history: WorkSessionHistory): void => {
  setStorageItem(STORAGE_KEY_WORK_SESSIONS, history);
};
