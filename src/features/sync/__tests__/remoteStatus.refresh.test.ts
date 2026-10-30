import {
  mockDoc,
  mockExistingSyncDocument,
  mockGetDoc,
  mockGetOrCreateUser,
  mockMissingSyncDocument,
  setupSyncTestEnvironment,
} from "./sync.test.utils";
import {
  refreshRemoteSyncStatus,
  refreshSyncStatusFromStoredRemote,
} from "../sync/remoteStatus";
import { getSyncStatus, setSyncStatus } from "../sync/statusStore";
import * as localData from "../sync/localData";

jest.mock("../sync/localData", () => ({
  collectLocalSyncData: jest.fn(),
  getLocalLastModified: jest.fn(),
  saveSyncDataToLocal: jest.fn(),
  hasLocalData: jest.fn(),
}));

const mockGetLocalLastModified = localData.getLocalLastModified as jest.Mock;

const T_LOCAL = 1_000_000;
const T_REMOTE_NEWER = 2_000_000;

/** 事前に保存しておく同期状態（更新されなかったことを確かめるための目印入り） */
const PREVIOUS_STATUS = {
  remoteLastModified: 123,
  hasRemoteChanges: true,
  error: "前回のエラー",
};

describe("refreshRemoteSyncStatus", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    mockGetLocalLastModified.mockReturnValue(T_LOCAL);
    (localData.collectLocalSyncData as jest.Mock).mockReturnValue({});
  });

  it("リモートの lastModified がローカルより新しければ hasRemoteChanges にする", async () => {
    mockExistingSyncDocument({ lastModified: T_REMOTE_NEWER });

    await refreshRemoteSyncStatus();

    expect(mockDoc).toHaveBeenCalledWith({}, "users", "user-1");
    expect(getSyncStatus()).toEqual(
      expect.objectContaining({
        remoteLastModified: T_REMOTE_NEWER,
        localLastModified: T_LOCAL,
        hasRemoteChanges: true,
        hasLocalChanges: false,
      }),
    );
  });

  it("ISO 文字列の lastModified もミリ秒に変換して比較する", async () => {
    const iso = "2026-10-30T00:00:00.000Z";
    mockExistingSyncDocument({ lastModified: iso });

    await refreshRemoteSyncStatus();

    expect(getSyncStatus().remoteLastModified).toBe(Date.parse(iso));
  });

  it("リモートのドキュメントが無ければリモートの時刻なしとして比較する", async () => {
    mockMissingSyncDocument();

    await refreshRemoteSyncStatus();

    expect(getSyncStatus()).toEqual(
      expect.objectContaining({
        remoteLastModified: null,
        hasRemoteChanges: false,
        hasLocalChanges: true,
      }),
    );
  });

  it.each([
    ["未設定", {}],
    ["解釈できない文字列", { lastModified: "not-a-date" }],
    ["オブジェクト", { lastModified: { seconds: 1 } }],
    ["NaN", { lastModified: Number.NaN }],
    ["null", { lastModified: null }],
  ])(
    "lastModified が%sのときはリモートの時刻なしとして扱う",
    async (_label, data) => {
      mockExistingSyncDocument(data);

      await refreshRemoteSyncStatus();

      expect(getSyncStatus()).toEqual(
        expect.objectContaining({
          remoteLastModified: null,
          hasRemoteChanges: false,
        }),
      );
    },
  );

  it("ユーザーの取得に失敗しても拒否せず、同期状態を変えない", async () => {
    setSyncStatus(PREVIOUS_STATUS);
    mockGetOrCreateUser.mockRejectedValueOnce(new Error("auth/network"));

    await expect(refreshRemoteSyncStatus()).resolves.toBeUndefined();

    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(getSyncStatus()).toEqual(expect.objectContaining(PREVIOUS_STATUS));
  });

  it("ドキュメントの取得に失敗しても拒否せず、同期状態を変えない", async () => {
    setSyncStatus(PREVIOUS_STATUS);
    mockGetDoc.mockRejectedValueOnce(new Error("permission-denied"));

    await expect(refreshRemoteSyncStatus()).resolves.toBeUndefined();

    expect(getSyncStatus()).toEqual(expect.objectContaining(PREVIOUS_STATUS));
  });

  it("ドキュメントの中身が null でも拒否しない（例外は握りつぶす）", async () => {
    setSyncStatus(PREVIOUS_STATUS);
    mockExistingSyncDocument(null);

    await expect(refreshRemoteSyncStatus()).resolves.toBeUndefined();

    expect(getSyncStatus()).toEqual(expect.objectContaining(PREVIOUS_STATUS));
  });
});

describe("refreshSyncStatusFromStoredRemote", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    (localData.collectLocalSyncData as jest.Mock).mockReturnValue({});
  });

  it("保存済みの remoteLastModified とローカルの時刻を比べ直す（通信しない）", () => {
    setSyncStatus({ remoteLastModified: T_LOCAL, hasRemoteChanges: false });
    mockGetLocalLastModified.mockReturnValue(T_REMOTE_NEWER);

    refreshSyncStatusFromStoredRemote();

    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(getSyncStatus()).toEqual(
      expect.objectContaining({
        remoteLastModified: T_LOCAL,
        localLastModified: T_REMOTE_NEWER,
        hasRemoteChanges: false,
        hasLocalChanges: true,
      }),
    );
  });

  it("保存済みの remoteLastModified が無ければリモートの時刻なしとして比べる", () => {
    mockGetLocalLastModified.mockReturnValue(T_LOCAL);

    refreshSyncStatusFromStoredRemote();

    expect(getSyncStatus()).toEqual(
      expect.objectContaining({
        remoteLastModified: null,
        hasRemoteChanges: false,
        hasLocalChanges: true,
      }),
    );
  });

  it("ローカルにもリモートにも時刻が無ければ変更なしにする", () => {
    mockGetLocalLastModified.mockReturnValue(0);

    refreshSyncStatusFromStoredRemote();

    expect(getSyncStatus()).toEqual(
      expect.objectContaining({
        localLastModified: null,
        remoteLastModified: null,
        hasRemoteChanges: false,
        hasLocalChanges: false,
      }),
    );
  });
});
