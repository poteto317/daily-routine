import { act, renderHook } from "@testing-library/react";

jest.mock("../sync", () => ({
  applySyncSnapshot: jest.fn(),
  deleteSyncSnapshot: jest.fn(),
  getSyncSnapshots: jest.fn(),
}));

jest.mock("@/hooks/headerSyncReload", () => ({
  reloadAfterDownload: jest.fn(),
}));

import { reloadAfterDownload } from "@/hooks/headerSyncReload";
import {
  applySyncSnapshot,
  deleteSyncSnapshot,
  getSyncSnapshots,
} from "../sync";
import texts from "../locales/ja.json";
import { useSyncManagementPageState } from "../useSyncManagementPageState";
import {
  defaultSyncSnapshotFixture,
  mockSyncSnapshotsResponse,
  waitForLoadedSyncState,
} from "./syncSnapshotUi.test.utils";

const renderLoadedSyncManagementPageState = async () => {
  const rendered = renderHook(() => useSyncManagementPageState());

  await waitForLoadedSyncState(rendered.result);

  return rendered;
};

describe("useSyncManagementPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
    mockSyncSnapshotsResponse();
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("初回ロードで同期履歴一覧を取得する", async () => {
    const { result } = renderHook(() => useSyncManagementPageState());

    expect(result.current.isLoading).toBe(true);

    await waitForLoadedSyncState(result);

    expect(result.current.snapshots).toEqual([defaultSyncSnapshotFixture]);
    expect(result.current.error).toBeNull();
  });

  it("読み込み失敗時はエラー文言を保持する", async () => {
    (getSyncSnapshots as jest.Mock).mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useSyncManagementPageState());

    await waitForLoadedSyncState(result);

    expect(result.current.error).toBe(texts.snapshotManager.loadFailed);
    expect(result.current.snapshots).toEqual([]);
  });

  it("履歴適用成功時に通知とリロードを実行する", async () => {
    const { result } = await renderLoadedSyncManagementPageState();

    await act(async () => {
      await result.current.handleApply("snapshot-1");
    });

    expect(applySyncSnapshot).toHaveBeenCalledWith("snapshot-1");
    expect(window.alert).toHaveBeenCalledWith(
      texts.snapshotManager.applySuccess,
    );
    expect(reloadAfterDownload).toHaveBeenCalled();
    expect(result.current.activeSnapshotId).toBeNull();
  });

  it("履歴削除をキャンセルした場合は削除しない", async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    const { result } = await renderLoadedSyncManagementPageState();

    await act(async () => {
      await result.current.handleDelete("snapshot-1");
    });

    expect(deleteSyncSnapshot).not.toHaveBeenCalled();
    expect(result.current.snapshots).toEqual([defaultSyncSnapshotFixture]);
  });

  it("履歴削除成功時に一覧から除外する", async () => {
    const { result } = await renderLoadedSyncManagementPageState();

    await act(async () => {
      await result.current.handleDelete("snapshot-1");
    });

    expect(deleteSyncSnapshot).toHaveBeenCalledWith("snapshot-1");
    expect(result.current.snapshots).toEqual([]);
    expect(result.current.activeSnapshotId).toBeNull();
  });
});
