import { setupSyncTestEnvironment } from "./sync.test.utils";
import { setSyncStatusFromComparison } from "../sync/remoteStatus";
import { getSyncStatus } from "../sync/statusStore";
import { saveSyncedContentHash } from "../sync/syncedContentHash";
import { setCurrentUserId } from "@/lib/storage/core";
import * as localData from "../sync/localData";

jest.mock("../sync/localData", () => ({
  collectLocalSyncData: jest.fn(),
  getLocalLastModified: jest.fn(),
  saveSyncDataToLocal: jest.fn(),
  hasLocalData: jest.fn(),
}));

const mockCollectLocalSyncData = localData.collectLocalSyncData as jest.Mock;
const mockGetLocalLastModified = localData.getLocalLastModified as jest.Mock;

const T_REMOTE = 1_000_000;
const T_LOCAL_NEWER = 1_000_001;

describe("remoteStatus / setSyncStatusFromComparison", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    setCurrentUserId(null);
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("localLastModified > remoteLastModified のとき hasLocalChanges = true", () => {
    mockGetLocalLastModified.mockReturnValue(T_LOCAL_NEWER);
    mockCollectLocalSyncData.mockReturnValue({ routines: [] });

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasLocalChanges).toBe(true);
  });

  it("localLastModified <= remoteLastModified のとき hasLocalChanges = false", () => {
    mockGetLocalLastModified.mockReturnValue(T_REMOTE);
    mockCollectLocalSyncData.mockReturnValue({ routines: [] });

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasLocalChanges).toBe(false);
  });

  it("ハッシュ未保存の場合はタイムスタンプ比較のみ（hasLocalChanges = true）", () => {
    mockGetLocalLastModified.mockReturnValue(T_LOCAL_NEWER);
    mockCollectLocalSyncData.mockReturnValue({ routines: [] });
    // ハッシュを保存しない

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasLocalChanges).toBe(true);
  });

  it("タイムスタンプが新しくても、ハッシュが一致すれば hasLocalChanges = false", () => {
    const syncedData = { routines: [], settings: { theme: "auto" } };
    mockGetLocalLastModified.mockReturnValue(T_LOCAL_NEWER);
    mockCollectLocalSyncData.mockReturnValue(syncedData);

    // 設定を変更後に元に戻した状態: ハッシュは同期済みデータと同一
    saveSyncedContentHash(syncedData);

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasLocalChanges).toBe(false);
  });

  it("タイムスタンプが新しく、ハッシュが不一致なら hasLocalChanges = true のまま", () => {
    const syncedData = { routines: [] };
    const localData2 = { routines: [{ id: "r1" }] }; // 実際に変更あり
    mockGetLocalLastModified.mockReturnValue(T_LOCAL_NEWER);
    mockCollectLocalSyncData.mockReturnValue(localData2);

    // 同期済みハッシュは syncedData を元に計算
    saveSyncedContentHash(syncedData);

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasLocalChanges).toBe(true);
  });

  it("hasRemoteChanges: remoteLastModified > localLastModified のとき true", () => {
    mockGetLocalLastModified.mockReturnValue(T_REMOTE - 1);
    mockCollectLocalSyncData.mockReturnValue({ routines: [] });

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasRemoteChanges).toBe(true);
    expect(getSyncStatus().hasLocalChanges).toBe(false);
  });

  it("localLastModified が 0 のとき hasLocalChanges = false", () => {
    mockGetLocalLastModified.mockReturnValue(0);
    mockCollectLocalSyncData.mockReturnValue({ routines: [] });

    setSyncStatusFromComparison(T_REMOTE);

    expect(getSyncStatus().hasLocalChanges).toBe(false);
  });
});
