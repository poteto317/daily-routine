import type { SyncData, SyncPayload } from "./types";

export const createSyncPayload = (data: SyncData): SyncPayload => {
  const { lastModified, deviceId, ...payload } = data;
  void lastModified;
  void deviceId;
  return payload;
};
