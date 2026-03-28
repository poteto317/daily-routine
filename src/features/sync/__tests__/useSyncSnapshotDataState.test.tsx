import { renderHook, waitFor } from "@testing-library/react";

jest.mock("../sync", () => ({
  getSyncSnapshots: jest.fn(),
}));

import { getSyncSnapshots } from "../sync";
import texts from "../locales/ja.json";
import { useSyncSnapshotDataState } from "../useSyncSnapshotDataState";

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

describe("useSyncSnapshotDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSyncSnapshots as jest.Mock).mockResolvedValue([mockSnapshot]);
  });

  it("初回ロードで同期履歴一覧を取得する", async () => {
    const { result } = renderHook(() => useSyncSnapshotDataState());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.snapshots).toEqual([mockSnapshot]);
    expect(result.current.error).toBeNull();
  });

  it("読み込み失敗時はエラー文言を保持する", async () => {
    (getSyncSnapshots as jest.Mock).mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useSyncSnapshotDataState());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(texts.snapshotManager.loadFailed);
    expect(result.current.snapshots).toEqual([]);
  });
});
