import { renderHook } from "@testing-library/react";

jest.mock("../state/useCloudSyncStatusState", () => ({
  useCloudSyncStatusState: jest.fn(),
}));

jest.mock("../state/useCloudSyncActions", () => ({
  useCloudSyncActions: jest.fn(),
}));

jest.mock("../state/cloudSyncStateResult", () => ({
  createCloudSyncStateResult: jest.fn(),
}));

import { createCloudSyncStateResult } from "../state/cloudSyncStateResult";
import { useCloudSyncActions } from "../state/useCloudSyncActions";
import { useCloudSyncStatusState } from "../state/useCloudSyncStatusState";
import { useCloudSyncState } from "../state/useCloudSyncState";

describe("useCloudSyncState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createCloudSyncStateResult as jest.Mock).mockImplementation(
      ({ actions, statusState }) => ({
        syncStatus: statusState.syncStatus,
        handleUploadToCloud: actions.handleUploadToCloud,
        handleDownloadFromCloud: actions.handleDownloadFromCloud,
      }),
    );
  });

  it("status state と action hook を compose し result builder へ委譲する", () => {
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

    (useCloudSyncStatusState as jest.Mock).mockReturnValue({ syncStatus });
    (useCloudSyncActions as jest.Mock).mockReturnValue({
      handleUploadToCloud,
      handleDownloadFromCloud,
    });

    const { result } = renderHook(() => useCloudSyncState());

    expect(createCloudSyncStateResult).toHaveBeenCalledWith({
      actions: (useCloudSyncActions as jest.Mock).mock.results[0].value,
      statusState: (useCloudSyncStatusState as jest.Mock).mock.results[0].value,
    });
    expect(result.current).toEqual({
      syncStatus,
      handleUploadToCloud,
      handleDownloadFromCloud,
    });
  });
});
