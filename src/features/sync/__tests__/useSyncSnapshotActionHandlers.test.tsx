import { act, renderHook } from "@testing-library/react";

jest.mock("../sync", () => ({
  applySyncSnapshot: jest.fn(),
  deleteSyncSnapshot: jest.fn(),
}));

jest.mock("@/hooks/headerSyncReload", () => ({
  reloadAfterDownload: jest.fn(),
}));

import { reloadAfterDownload } from "@/hooks/headerSyncReload";
import { applySyncSnapshot, deleteSyncSnapshot } from "../sync";
import texts from "../locales/ja.json";
import { useSyncSnapshotActionHandlers } from "../useSyncSnapshotActionHandlers";

describe("useSyncSnapshotActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("履歴適用成功時に通知とリロードを実行する", async () => {
    const setActiveSnapshotId = jest.fn();
    const setSnapshots = jest.fn();
    const { result } = renderHook(() =>
      useSyncSnapshotActionHandlers({ setActiveSnapshotId, setSnapshots }),
    );

    await act(async () => {
      await result.current.handleApply("snapshot-1");
    });

    expect(setActiveSnapshotId).toHaveBeenNthCalledWith(1, "snapshot-1");
    expect(applySyncSnapshot).toHaveBeenCalledWith("snapshot-1");
    expect(window.alert).toHaveBeenCalledWith(
      texts.snapshotManager.applySuccess,
    );
    expect(reloadAfterDownload).toHaveBeenCalled();
    expect(setActiveSnapshotId).toHaveBeenLastCalledWith(null);
  });

  it("履歴削除成功時に一覧から除外する", async () => {
    const setActiveSnapshotId = jest.fn();
    const setSnapshots = jest.fn();
    const { result } = renderHook(() =>
      useSyncSnapshotActionHandlers({ setActiveSnapshotId, setSnapshots }),
    );

    await act(async () => {
      await result.current.handleDelete("snapshot-1");
    });

    expect(deleteSyncSnapshot).toHaveBeenCalledWith("snapshot-1");
    expect(setSnapshots).toHaveBeenCalledWith(expect.any(Function));
    expect(setActiveSnapshotId).toHaveBeenNthCalledWith(1, "snapshot-1");
    expect(setActiveSnapshotId).toHaveBeenLastCalledWith(null);
  });

  it("履歴削除をキャンセルした場合は削除しない", async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    const setActiveSnapshotId = jest.fn();
    const setSnapshots = jest.fn();
    const { result } = renderHook(() =>
      useSyncSnapshotActionHandlers({ setActiveSnapshotId, setSnapshots }),
    );

    await act(async () => {
      await result.current.handleDelete("snapshot-1");
    });

    expect(deleteSyncSnapshot).not.toHaveBeenCalled();
    expect(setSnapshots).not.toHaveBeenCalled();
    expect(setActiveSnapshotId).not.toHaveBeenCalled();
  });
});
