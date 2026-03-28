import { createCloudSyncStateResult } from "../state/cloudSyncStateResult";

describe("cloudSyncStateResult", () => {
  it("cloud sync state の公開 shape を組み立てる", () => {
    const handleUploadToCloud = jest.fn();
    const handleDownloadFromCloud = jest.fn();
    const syncStatus = {
      isSyncing: false,
      lastSyncTime: null,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: true,
      hasLocalChanges: false,
      error: null,
    };

    expect(
      createCloudSyncStateResult({
        actions: {
          handleUploadToCloud,
          handleDownloadFromCloud,
        },
        statusState: {
          syncStatus,
        },
      }),
    ).toEqual({
      syncStatus,
      handleUploadToCloud,
      handleDownloadFromCloud,
    });
  });
});
