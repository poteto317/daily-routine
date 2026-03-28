import { act, renderHook } from "@testing-library/react";

jest.mock("../sync", () => ({
  getSyncSnapshots: jest.fn(),
}));

import { getSyncSnapshots } from "../sync";
import texts from "../locales/ja.json";
import { useSyncSnapshotLoadAction } from "../useSyncSnapshotLoadAction";

describe("useSyncSnapshotLoadAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("履歴一覧をロードして state setter を更新する", async () => {
    const snapshots = [{ id: "snapshot-1" }];
    (getSyncSnapshots as jest.Mock).mockResolvedValue(snapshots);
    const setError = jest.fn();
    const setIsLoading = jest.fn();
    const setSnapshots = jest.fn();

    const { result } = renderHook(() =>
      useSyncSnapshotLoadAction({
        setError,
        setIsLoading,
        setSnapshots,
      }),
    );

    await act(async () => {
      await result.current();
    });

    expect(setIsLoading).toHaveBeenNthCalledWith(1, true);
    expect(setError).toHaveBeenNthCalledWith(1, null);
    expect(setSnapshots).toHaveBeenCalledWith(snapshots);
    expect(setIsLoading).toHaveBeenLastCalledWith(false);
  });

  it("失敗時は error を設定する", async () => {
    (getSyncSnapshots as jest.Mock).mockRejectedValue(new Error("failed"));
    const setError = jest.fn();
    const setIsLoading = jest.fn();
    const setSnapshots = jest.fn();

    const { result } = renderHook(() =>
      useSyncSnapshotLoadAction({
        setError,
        setIsLoading,
        setSnapshots,
      }),
    );

    await act(async () => {
      await result.current();
    });

    expect(setSnapshots).not.toHaveBeenCalled();
    expect(setError).toHaveBeenLastCalledWith(texts.snapshotManager.loadFailed);
    expect(setIsLoading).toHaveBeenLastCalledWith(false);
  });
});
