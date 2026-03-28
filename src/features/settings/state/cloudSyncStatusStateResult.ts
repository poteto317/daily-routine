import type { SyncStatus } from "@/features/sync";

type CloudSyncStatusStateResultInput = {
  syncStatus: SyncStatus;
};

export const createCloudSyncStatusStateResult = ({
  syncStatus,
}: CloudSyncStatusStateResultInput) => ({
  syncStatus,
});
