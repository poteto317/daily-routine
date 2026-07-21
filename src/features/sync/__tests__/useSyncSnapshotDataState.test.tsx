import { act, renderHook } from "@testing-library/react";

jest.mock("../sync", () => ({
  getSyncSnapshots: jest.fn(),
}));

import { getSyncSnapshots } from "../sync";
import texts from "../locales/ja.json";
import { useSyncSnapshotDataState } from "../useSyncSnapshotDataState";
import {
  defaultSyncSnapshotFixture,
  mockSyncSnapshotsResponse,
  nextSyncSnapshotFixture,
  waitForLoadedSyncState,
} from "./syncSnapshotUi.test.utils";

const renderLoadedSyncSnapshotDataState = async () => {
  const rendered = renderHook(() => useSyncSnapshotDataState());

  await waitForLoadedSyncState(rendered.result);

  return rendered;
};

describe("useSyncSnapshotDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSyncSnapshotsResponse();
  });

  it("初回ロードで同期履歴一覧を取得する", async () => {
    const { result } = renderHook(() => useSyncSnapshotDataState());

    expect(result.current.isLoading).toBe(true);

    await waitForLoadedSyncState(result);

    expect(result.current.snapshots).toEqual([defaultSyncSnapshotFixture]);
    expect(result.current.error).toBeNull();
  });

  it("読み込み失敗時はエラー文言を保持する", async () => {
    (getSyncSnapshots as jest.Mock).mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useSyncSnapshotDataState());

    await waitForLoadedSyncState(result);

    expect(result.current.error).toBe(texts.snapshotManager.loadFailed);
    expect(result.current.snapshots).toEqual([]);
  });

  it("loadSnapshotsを再実行すると同期履歴一覧を更新する", async () => {
    const { result } = await renderLoadedSyncSnapshotDataState();
    (getSyncSnapshots as jest.Mock).mockResolvedValueOnce([
      nextSyncSnapshotFixture,
    ]);

    await act(async () => {
      await result.current.loadSnapshots();
    });

    expect(result.current.snapshots).toEqual([nextSyncSnapshotFixture]);
    expect(result.current.error).toBeNull();
  });
});
