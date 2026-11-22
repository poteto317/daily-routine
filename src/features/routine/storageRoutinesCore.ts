import type { Routine } from "@/types/routine";
import type { SetStorageItemOptions } from "@/lib/storage/core";
import {
  getUserScopedKey,
  setStorageItem,
  wasLegacyRoutineStorageCopied,
} from "@/lib/storage/core";
import { migrateRoutineRecord } from "./storageMigration";

const STORAGE_KEY_ROUTINES = "daily-routines";

const readRoutines = (data: string | null): Routine[] | null => {
  if (data === null) return null;
  const routines: unknown = JSON.parse(data);
  return Array.isArray(routines) ? routines.map(migrateRoutineRecord) : null;
};

export const getRoutines = (): Routine[] => {
  if (typeof window === "undefined") return [];
  try {
    return (
      readRoutines(
        localStorage.getItem(getUserScopedKey(STORAGE_KEY_ROUTINES)),
      ) ?? []
    );
  } catch {
    return [];
  }
};

export const getNotificationBootstrapRoutines = (
  uid: string,
): Routine[] | null => {
  try {
    if (!uid || wasLegacyRoutineStorageCopied(uid)) return null;
    return readRoutines(
      localStorage.getItem(getUserScopedKey(STORAGE_KEY_ROUTINES, uid)),
    );
  } catch {
    return null;
  }
};

export const saveRoutines = (
  routines: Routine[],
  options?: SetStorageItemOptions,
): void => {
  setStorageItem(STORAGE_KEY_ROUTINES, routines, options);
};
