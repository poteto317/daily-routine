import { createHeaderSyncControllerResult } from "@/hooks/headerSyncControllerResult";
import type { HeaderSyncStatus } from "@/hooks/useHeaderSync";

describe("createHeaderSyncControllerResult", () => {
  it("controller 向けの公開 shape をまとめて返す", async () => {
    const syncStatus: HeaderSyncStatus = {
      isSyncing: false,
      lastSyncTime: null,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    };
    const handleUploadClick = jest.fn().mockResolvedValue(undefined);
    const handleDownloadClick = jest.fn().mockResolvedValue(undefined);

    const result = createHeaderSyncControllerResult({
      syncStatus,
      handleUploadClick,
      handleDownloadClick,
    });

    expect(result).toEqual({
      syncStatus,
      handleUploadClick,
      handleDownloadClick,
    });

    await result.handleUploadClick();
    await result.handleDownloadClick();

    expect(handleUploadClick).toHaveBeenCalledTimes(1);
    expect(handleDownloadClick).toHaveBeenCalledTimes(1);
  });
});
