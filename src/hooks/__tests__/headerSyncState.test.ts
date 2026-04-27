import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
import {
  mockGetSyncStatus,
  mockRefreshSyncStatusFromStoredRemote,
  mockResetStaleSyncingState,
  setupHeaderHooksMocks,
} from "./header-hooks.test-setup";
import {
  initializeHeaderSyncState,
  getInitialHeaderSyncStatus,
  registerHeaderSyncListeners,
  recalculateHeaderSyncStatus,
} from "@/hooks/headerSyncState";

describe("headerSyncState", () => {
  beforeEach(() => {
    setupHeaderHooksMocks();
  });

  describe("getInitialHeaderSyncStatus", () => {
    it("初期状態はgetSyncStatusから取得する", () => {
      expect(getInitialHeaderSyncStatus()).toEqual(
        mockGetSyncStatus.mock.results[0]?.value,
      );
    });

    it("resetStaleSyncingState を呼び出さない（副作用なし）", () => {
      getInitialHeaderSyncStatus();

      expect(mockResetStaleSyncingState).not.toHaveBeenCalled();
    });
  });

  describe("initializeHeaderSyncState", () => {
    it("resetStaleSyncingState を呼び出す", () => {
      initializeHeaderSyncState();

      expect(mockResetStaleSyncingState).toHaveBeenCalledTimes(1);
    });
  });

  it("sync-status-changedイベントで状態更新を通知する", () => {
    const setSyncStatus = jest.fn();
    const dispose = registerHeaderSyncListeners({
      setSyncStatus,
      recalculateSyncStatus: jest.fn(),
    });

    const nextStatus = {
      isSyncing: false,
      lastSyncTime: "2026-02-13T00:00:00.000Z",
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: true,
      hasLocalChanges: false,
      error: null,
    };

    window.dispatchEvent(
      new CustomEvent("sync-status-changed", { detail: nextStatus }),
    );

    expect(setSyncStatus).toHaveBeenCalledWith(nextStatus);
    dispose();
  });

  it("ローカル更新イベントで再計算する", () => {
    const recalculateSyncStatus = jest.fn();
    const dispose = registerHeaderSyncListeners({
      setSyncStatus: jest.fn(),
      recalculateSyncStatus,
    });

    window.dispatchEvent(new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT));

    expect(recalculateSyncStatus).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("recalculateHeaderSyncStatusは保存済みremote基準の再比較を行う", () => {
    recalculateHeaderSyncStatus();

    expect(mockRefreshSyncStatusFromStoredRemote).toHaveBeenCalledTimes(1);
  });
});
