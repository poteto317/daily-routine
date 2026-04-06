import * as routineStorage from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
  getUserScopedKey: jest.fn((key: string) => key),
  timeToMinutes: jest.fn(),
  minutesToTime: jest.fn(),
}));

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("routine storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getDailyProgressはdaily-progressキーから進捗を取得する", () => {
    const progress = {
      date: "2026-02-12",
      completedRoutineIds: ["r1", "r2"],
      lastResetTime: "2026-02-12T00:00:00.000Z",
    };
    mockGetStorageItem.mockReturnValue(progress as never);

    const result = routineStorage.getDailyProgress();

    expect(mockGetStorageItem).toHaveBeenCalledWith("daily-progress", null);
    expect(result).toEqual(progress);
  });

  it("saveDailyProgressは進捗保存後に日次履歴も更新する", () => {
    const progress = {
      date: "2026-02-12",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-02-12T00:00:00.000Z",
    };
    const saveDailyHistorySpy = jest
      .spyOn(routineStorage, "saveDailyHistory")
      .mockImplementation(() => undefined);

    routineStorage.saveDailyProgress(progress);

    expect(mockSetStorageItem).toHaveBeenCalledWith("daily-progress", progress);
    expect(saveDailyHistorySpy).toHaveBeenCalledWith("2026-02-12", ["r1"]);

    saveDailyHistorySpy.mockRestore();
  });

  it("saveDailyProgressForSyncは履歴更新せずに進捗のみ保存する", () => {
    const progress = {
      date: "2026-02-12",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-02-12T00:00:00.000Z",
    };
    const saveDailyHistorySpy = jest
      .spyOn(routineStorage, "saveDailyHistory")
      .mockImplementation(() => undefined);

    routineStorage.saveDailyProgressForSync(progress);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "daily-progress",
      progress,
      {
        skipLocalDataUpdatedAt: true,
      },
    );
    expect(saveDailyHistorySpy).not.toHaveBeenCalled();

    saveDailyHistorySpy.mockRestore();
  });

  it("saveDailyProgressSilentlyは履歴を更新しつつローカル更新時刻は進めない", () => {
    const progress = {
      date: "2026-02-12",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-02-12T00:00:00.000Z",
    };
    const saveDailyHistorySpy = jest
      .spyOn(routineStorage, "saveDailyHistory")
      .mockImplementation(() => undefined);

    routineStorage.saveDailyProgressSilently(progress);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "daily-progress",
      progress,
      {
        skipLocalDataUpdatedAt: true,
      },
    );
    // skipLocalDataUpdatedAt: true が saveDailyHistory にも伝播されること
    expect(saveDailyHistorySpy).toHaveBeenCalledWith("2026-02-12", ["r1"], {
      skipLocalDataUpdatedAt: true,
    });

    saveDailyHistorySpy.mockRestore();
  });

  it("saveDailyHistoryはoptionsをsaveMonthlyHistory経由でsetStorageItemへ伝播する", () => {
    // getMonthlyHistory が返す値を設定（mockReturnValueOnce で後続テストに影響させない）
    mockGetStorageItem.mockReturnValueOnce({});

    routineStorage.saveDailyHistory("2026-02-12", [], {
      skipLocalDataUpdatedAt: true,
    });

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "daily-history",
      expect.any(Object),
      { skipLocalDataUpdatedAt: true },
    );
  });

  it("getDailyHistoryは対象日がなければnullを返す", () => {
    jest.spyOn(routineStorage, "getMonthlyHistory").mockReturnValue({});

    const result = routineStorage.getDailyHistory("2026-02-12");

    expect(result).toBeNull();
  });
});
