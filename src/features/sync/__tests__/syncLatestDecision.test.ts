import {
  buildNoDataSyncStatus,
  buildUpToDateSyncStatus,
  resolveSyncLatestPlan,
} from "../sync/syncLatestDecision";

describe("syncLatestDecision", () => {
  it("リモートもローカルも空なら no-data を返す", () => {
    expect(
      resolveSyncLatestPlan({
        remoteExists: false,
        hasLocalData: false,
        localLastModified: 0,
        remoteLastModified: 0,
        now: 123,
      }),
    ).toEqual({
      action: "no-data",
      effect: "none",
      nextStatus: buildNoDataSyncStatus(0),
    });
  });

  it("リモートがなくローカルがあれば upload を返す", () => {
    expect(
      resolveSyncLatestPlan({
        remoteExists: false,
        hasLocalData: true,
        localLastModified: 10,
        remoteLastModified: 0,
        now: 123,
      }),
    ).toEqual({
      action: "uploaded",
      effect: "upload",
    });
  });

  it("クラウドが新しければ download を返す", () => {
    expect(
      resolveSyncLatestPlan({
        remoteExists: true,
        hasLocalData: true,
        localLastModified: 10,
        remoteLastModified: 20,
        now: 123,
      }),
    ).toEqual({
      action: "downloaded",
      effect: "download",
    });
  });

  it("ローカルが新しければ upload を返す", () => {
    expect(
      resolveSyncLatestPlan({
        remoteExists: true,
        hasLocalData: true,
        localLastModified: 20,
        remoteLastModified: 10,
        now: 123,
      }),
    ).toEqual({
      action: "uploaded",
      effect: "upload",
    });
  });

  it("同じ更新時刻なら up-to-date と status を返す", () => {
    expect(
      resolveSyncLatestPlan({
        remoteExists: true,
        hasLocalData: true,
        localLastModified: 20,
        remoteLastModified: 20,
        now: 123,
      }),
    ).toEqual({
      action: "up-to-date",
      effect: "none",
      nextStatus: buildUpToDateSyncStatus({
        now: 123,
        localLastModified: 20,
        remoteLastModified: 20,
      }),
    });
  });

  it("status builder は 0 以下の時刻を null に正規化する", () => {
    expect(buildNoDataSyncStatus(0)).toEqual({
      isSyncing: false,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });

    expect(
      buildUpToDateSyncStatus({
        now: 123,
        localLastModified: 0,
        remoteLastModified: 30,
      }),
    ).toEqual({
      isSyncing: false,
      lastSyncTime: 123,
      localLastModified: null,
      remoteLastModified: 30,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });
});
