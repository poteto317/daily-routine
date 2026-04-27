import { act, renderHook } from "@testing-library/react";
import {
  mockGetSyncStatus,
  mockRefreshRemoteSyncStatus,
  setupHeaderHooksMocks,
} from "./header-hooks.test-setup";
import { useHeaderSyncStatus } from "@/hooks/useHeaderSyncStatus";
import * as headerSyncState from "@/hooks/headerSyncState";

describe("useHeaderSyncStatus", () => {
  beforeEach(() => {
    setupHeaderHooksMocks();
  });

  it("初期状態を読み取り、mount 時に remote status を更新する", () => {
    const { result } = renderHook(() => useHeaderSyncStatus());

    expect(result.current).toEqual(mockGetSyncStatus.mock.results[0]?.value);
    expect(mockRefreshRemoteSyncStatus).toHaveBeenCalledTimes(1);
  });

  it("mount 時に useLayoutEffect で initializeHeaderSyncState を呼び出す", async () => {
    const initializeSpy = jest
      .spyOn(headerSyncState, "initializeHeaderSyncState")
      .mockImplementation(() => {});

    renderHook(() => useHeaderSyncStatus());

    await act(async () => {});

    expect(initializeSpy).toHaveBeenCalledTimes(1);

    initializeSpy.mockRestore();
  });

  it("sync-status-changed イベントで状態を更新する", () => {
    const { result } = renderHook(() => useHeaderSyncStatus());

    act(() => {
      window.dispatchEvent(
        new CustomEvent("sync-status-changed", {
          detail: {
            isSyncing: false,
            lastSyncTime: "2026-02-13T00:00:00.000Z",
            localLastModified: null,
            remoteLastModified: null,
            hasRemoteChanges: true,
            hasLocalChanges: false,
            error: null,
          },
        }),
      );
    });

    expect(result.current.hasRemoteChanges).toBe(true);
    expect(result.current.lastSyncTime).toBe("2026-02-13T00:00:00.000Z");
  });

  it("ローカル更新イベントに反応できる", () => {
    renderHook(() => useHeaderSyncStatus());

    act(() => {
      window.dispatchEvent(
        new CustomEvent("local-data-updated", {
          detail: { timestamp: 123 },
        }),
      );
    });
  });
});
