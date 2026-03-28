import { createCloudSyncStatusStateResult } from "../state/cloudSyncStatusStateResult";

describe("createCloudSyncStatusStateResult", () => {
  it("cloud sync status state の公開 shape を返す", () => {
    const syncStatus = {
      isSyncing: false,
      lastSyncTime: null,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    };

    expect(
      createCloudSyncStatusStateResult({
        syncStatus,
      }),
    ).toEqual({
      syncStatus,
    });
  });
});
