import { act, renderHook, waitFor } from "@testing-library/react";

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

const mockSnapshot = {
  id: "snapshot-1",
  uploadedAt: Date.parse("2026-03-10T10:00:00.000Z"),
  deviceId: "device-1",
  data: {
    routines: [],
    dailyProgress: null,
    dailyHistory: {},
    settings: {},
    pomodoroHistory: {},
    workSessionHistory: {},
    workTemplates: [],
    weightHistory: {},
    journalHistory: {},
    budgetData: { budgets: {}, expenses: {} },
    mealHistory: {},
    presets: [],
    todoLists: [],
  },
};

describe("useSyncManagementPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (getSyncSnapshots as jest.Mock).mockResolvedValue([mockSnapshot]);
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("初回ロードで同期履歴一覧を取得する", async () => {
    const { result } = renderHook(() => useSyncManagementPageState());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.snapshots).toEqual([mockSnapshot]);
    expect(result.current.error).toBeNull();
  });

  it("読み込み失敗時はエラー文言を保持する", async () => {
    (getSyncSnapshots as jest.Mock).mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useSyncManagementPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(texts.snapshotManager.loadFailed);
    expect(result.current.snapshots).toEqual([]);
  });

  it("履歴適用成功時に通知とリロードを実行する", async () => {
    const { result } = renderHook(() => useSyncManagementPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

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
    const { result } = renderHook(() => useSyncManagementPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("snapshot-1");
    });

    expect(deleteSyncSnapshot).not.toHaveBeenCalled();
    expect(result.current.snapshots).toEqual([mockSnapshot]);
  });

  it("履歴削除成功時に一覧から除外する", async () => {
    const { result } = renderHook(() => useSyncManagementPageState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete("snapshot-1");
    });

    expect(deleteSyncSnapshot).toHaveBeenCalledWith("snapshot-1");
    expect(result.current.snapshots).toEqual([]);
    expect(result.current.activeSnapshotId).toBeNull();
  });
});
