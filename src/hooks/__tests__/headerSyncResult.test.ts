import { createHeaderSyncResult } from "@/hooks/headerSyncResult";

describe("createHeaderSyncResult", () => {
  it("header sync の公開 shape を組み立てる", () => {
    const syncStatus = {
      isSyncing: false,
      lastSyncTime: null,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    };
    const handleUpload = jest.fn();
    const handleDownload = jest.fn();

    expect(
      createHeaderSyncResult({
        syncStatus,
        handleUpload,
        handleDownload,
      }),
    ).toEqual({
      syncStatus,
      handleUpload,
      handleDownload,
    });
  });
});
