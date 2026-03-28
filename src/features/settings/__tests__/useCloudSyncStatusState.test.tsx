import { act, renderHook } from "@testing-library/react";
import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";

jest.mock("../state/cloudSyncStatusStateResult", () => ({
  createCloudSyncStatusStateResult: jest.fn(),
}));

jest.mock("@/features/sync", () => ({
  getSyncStatus: jest.fn(),
  refreshSyncStatusFromStoredRemote: jest.fn(),
  watchRemoteChanges: jest.fn(),
}));

import {
  getSyncStatus,
  refreshSyncStatusFromStoredRemote,
  watchRemoteChanges,
} from "@/features/sync";
import { createCloudSyncStatusStateResult } from "../state/cloudSyncStatusStateResult";
import { useCloudSyncStatusState } from "../state/useCloudSyncStatusState";

describe("useCloudSyncStatusState", () => {
  const baseStatus = {
    isSyncing: false,
    lastSyncTime: null,
    localLastModified: null,
    remoteLastModified: null,
    hasRemoteChanges: false,
    hasLocalChanges: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSyncStatus as jest.Mock).mockReturnValue(baseStatus);
    (watchRemoteChanges as jest.Mock).mockReturnValue(jest.fn());
    (createCloudSyncStatusStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("初期状態を同期 status から作り、イベント購読を登録する", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");

    const { result } = renderHook(() => useCloudSyncStatusState());

    expect(result.current.syncStatus).toEqual(baseStatus);
    expect(createCloudSyncStatusStateResult).toHaveBeenCalledWith({
      syncStatus: baseStatus,
    });
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "sync-status-changed",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      LOCAL_DATA_UPDATED_AT_EVENT,
      refreshSyncStatusFromStoredRemote,
    );
    expect(watchRemoteChanges).toHaveBeenCalledWith(expect.any(Function));
  });

  it("sync-status-changed event で状態を更新する", () => {
    const nextStatus = {
      ...baseStatus,
      isSyncing: true,
      hasRemoteChanges: true,
      lastSyncTime: 123,
    };
    const { result } = renderHook(() => useCloudSyncStatusState());

    act(() => {
      window.dispatchEvent(
        new CustomEvent("sync-status-changed", {
          detail: nextStatus,
        }),
      );
    });

    expect(result.current.syncStatus).toEqual(nextStatus);
    expect(createCloudSyncStatusStateResult).toHaveBeenLastCalledWith({
      syncStatus: nextStatus,
    });
  });

  it("unmount 時にイベント購読と remote watcher を解除する", () => {
    const unsubscribe = jest.fn();
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    (watchRemoteChanges as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useCloudSyncStatusState());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "sync-status-changed",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      LOCAL_DATA_UPDATED_AT_EVENT,
      refreshSyncStatusFromStoredRemote,
    );
    expect(unsubscribe).toHaveBeenCalled();
  });
});
