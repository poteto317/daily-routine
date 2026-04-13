import type { Routine } from "@/types/routine";
import type { SetStorageItemOptions } from "@/lib/storage/core";
import { getUserScopedKey, setStorageItem } from "@/lib/storage/core";
import { migrateRoutineRecord } from "./storageMigration";

const STORAGE_KEY_ROUTINES = "daily-routines";

export const getRoutines = (): Routine[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(getUserScopedKey(STORAGE_KEY_ROUTINES));
    const routines = data ? JSON.parse(data) : [];
    return routines.map(migrateRoutineRecord);
  } catch {
    return [];
  }
};

export const saveRoutines = (
  routines: Routine[],
  options?: SetStorageItemOptions,
): void => {
  setStorageItem(STORAGE_KEY_ROUTINES, routines, options);
};
