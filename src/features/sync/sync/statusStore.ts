import { DEFAULT_SYNC_STATUS, SYNC_STATUS_KEY } from "./constants";
import type { SyncStatus } from "./types";

export const getSyncStatus = (): SyncStatus => {
  const stored = localStorage.getItem(SYNC_STATUS_KEY);

  if (!stored) return DEFAULT_SYNC_STATUS;

  try {
    return {
      ...DEFAULT_SYNC_STATUS,
      ...(JSON.parse(stored) as Partial<SyncStatus>),
    };
  } catch {
    return DEFAULT_SYNC_STATUS;
  }
};

export const setSyncStatus = (status: Partial<SyncStatus>): void => {
  const current = getSyncStatus();
  const updated = { ...current, ...status };

  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
  window.dispatchEvent(
    new CustomEvent("sync-status-changed", { detail: updated }),
  );
};
