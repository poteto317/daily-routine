import {
  collectLocalSyncData,
  saveSyncDataToLocal,
  hasLocalData,
  getLocalLastModified,
} from "../sync/localData";

// ---- ストレージモック ----
jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(() => []),
  getDailyProgress: jest.fn(() => null),
  getMonthlyHistory: jest.fn(() => ({})),
  saveRoutines: jest.fn(),
  saveDailyProgressForSync: jest.fn(),
  saveMonthlyHistory: jest.fn(),
}));
jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(() => ({ theme: "auto" })),
  saveSettings: jest.fn(),
}));
jest.mock("@/features/pomodoro/storage", () => ({
  getPomodoroHistory: jest.fn(() => ({})),
  savePomodoroHistory: jest.fn(),
}));
jest.mock("@/features/work-tracker/storage", () => ({
  getWorkSessionHistory: jest.fn(() => ({})),
  getWorkTemplates: jest.fn(() => []),
  saveWorkSessionHistory: jest.fn(),
  saveWorkTemplates: jest.fn(),
}));
jest.mock("@/features/weight-tracker/storage", () => ({
  getWeightHistory: jest.fn(() => ({})),
  saveWeightHistory: jest.fn(),
}));
jest.mock("@/features/journal/storage", () => ({
  getJournalHistory: jest.fn(() => ({})),
  saveJournalHistory: jest.fn(),
}));
jest.mock("@/features/budget/storage", () => ({
  getBudgetData: jest.fn(() => ({ budgets: {}, expenses: {} })),
  saveBudgetData: jest.fn(),
  getBudgetCategories: jest.fn(() => []),
  saveBudgetCategories: jest.fn(),
}));
jest.mock("@/features/meal/storage", () => ({
  getMealHistory: jest.fn(() => ({})),
  saveMealHistory: jest.fn(),
}));
jest.mock("@/features/preset/storage", () => ({
  getPresets: jest.fn(() => []),
  savePresets: jest.fn(),
}));
jest.mock("@/features/todo-lists/storage", () => ({
  getTodoLists: jest.fn(() => []),
  saveTodoLists: jest.fn(),
}));
jest.mock("@/lib/storage/core", () => ({
  getLocalDataUpdatedAt: jest.fn(() => 0),
  setLocalDataUpdatedAt: jest.fn(),
  withSyncBatch: jest.fn((fn: () => void) => fn()),
}));
jest.mock("../sync/localDataHelpers", () => ({
  hasAnyLocalSyncData: jest.fn(() => false),
}));
jest.mock("../sync/timestamp", () => ({
  collectLatestTimestamp: jest.fn(() => 9999),
}));
// -------------------------

import * as routineStorage from "@/features/routine/storage";
import * as settingsStorage from "@/features/settings/storage";
import * as pomodoroStorage from "@/features/pomodoro/storage";
import * as workTrackerStorage from "@/features/work-tracker/storage";
import * as weightTrackerStorage from "@/features/weight-tracker/storage";
import * as journalStorage from "@/features/journal/storage";
import * as budgetStorage from "@/features/budget/storage";
import * as mealStorage from "@/features/meal/storage";
import * as presetStorage from "@/features/preset/storage";
import * as todoListsStorage from "@/features/todo-lists/storage";
import * as storageCore from "@/lib/storage/core";
import * as localDataHelpers from "../sync/localDataHelpers";
import * as timestamp from "../sync/timestamp";

describe("localData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトに戻す
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([]);
    (routineStorage.getDailyProgress as jest.Mock).mockReturnValue(null);
    (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue({});
    (settingsStorage.getSettings as jest.Mock).mockReturnValue({
      theme: "auto",
    });
    (pomodoroStorage.getPomodoroHistory as jest.Mock).mockReturnValue({});
    (workTrackerStorage.getWorkSessionHistory as jest.Mock).mockReturnValue({});
    (workTrackerStorage.getWorkTemplates as jest.Mock).mockReturnValue([]);
    (weightTrackerStorage.getWeightHistory as jest.Mock).mockReturnValue({});
    (journalStorage.getJournalHistory as jest.Mock).mockReturnValue({});
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue({
      budgets: {},
      expenses: {},
    });
    (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue([]);
    (mealStorage.getMealHistory as jest.Mock).mockReturnValue({});
    (presetStorage.getPresets as jest.Mock).mockReturnValue([]);
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([]);
    (storageCore.getLocalDataUpdatedAt as jest.Mock).mockReturnValue(0);
    (localDataHelpers.hasAnyLocalSyncData as jest.Mock).mockReturnValue(false);
    (timestamp.collectLatestTimestamp as jest.Mock).mockReturnValue(9999);
  });

  describe("collectLocalSyncData", () => {
    it("各ストレージから値を収集してオブジェクトを返す", () => {
      (routineStorage.getRoutines as jest.Mock).mockReturnValue([{ id: "r1" }]);
      (settingsStorage.getSettings as jest.Mock).mockReturnValue({
        theme: "dark",
      });
      (presetStorage.getPresets as jest.Mock).mockReturnValue([{ id: "p1" }]);
      (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue([
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ]);

      const result = collectLocalSyncData();

      expect(result.routines).toEqual([{ id: "r1" }]);
      expect(result.settings).toEqual({ theme: "dark" });
      expect(result.presets).toEqual([{ id: "p1" }]);
      expect(result.budgetCategories).toEqual([
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ]);
    });

    it("全ストレージ getter を呼び出す", () => {
      collectLocalSyncData();

      expect(routineStorage.getRoutines).toHaveBeenCalled();
      expect(routineStorage.getDailyProgress).toHaveBeenCalled();
      expect(routineStorage.getMonthlyHistory).toHaveBeenCalled();
      expect(settingsStorage.getSettings).toHaveBeenCalled();
      expect(pomodoroStorage.getPomodoroHistory).toHaveBeenCalled();
      expect(workTrackerStorage.getWorkSessionHistory).toHaveBeenCalled();
      expect(workTrackerStorage.getWorkTemplates).toHaveBeenCalled();
      expect(weightTrackerStorage.getWeightHistory).toHaveBeenCalled();
      expect(journalStorage.getJournalHistory).toHaveBeenCalled();
      expect(budgetStorage.getBudgetData).toHaveBeenCalled();
      expect(budgetStorage.getBudgetCategories).toHaveBeenCalled();
      expect(mealStorage.getMealHistory).toHaveBeenCalled();
      expect(presetStorage.getPresets).toHaveBeenCalled();
      expect(todoListsStorage.getTodoLists).toHaveBeenCalled();
    });
  });

  describe("saveSyncDataToLocal", () => {
    it("各ストレージ setter を呼び出す", () => {
      const routines = [{ id: "r1" }] as never[];
      const settings = { theme: "dark" as const } as never;

      saveSyncDataToLocal({ routines, settings, lastModified: 12345 });

      expect(routineStorage.saveRoutines).toHaveBeenCalledWith(routines);
      expect(settingsStorage.saveSettings).toHaveBeenCalledWith(settings);
      expect(storageCore.setLocalDataUpdatedAt).toHaveBeenCalledWith(12345);
    });

    it("lastModified が未指定の場合は現在時刻で setLocalDataUpdatedAt を呼ぶ", () => {
      const before = Date.now();
      saveSyncDataToLocal({});
      const after = Date.now();

      const called = (storageCore.setLocalDataUpdatedAt as jest.Mock).mock
        .calls[0][0] as number;
      expect(called).toBeGreaterThanOrEqual(before);
      expect(called).toBeLessThanOrEqual(after);
    });

    it("dailyProgress が undefined の場合 saveDailyProgressForSync は呼ばれない", () => {
      saveSyncDataToLocal({});
      expect(routineStorage.saveDailyProgressForSync).not.toHaveBeenCalled();
    });

    it("dailyProgress が指定された場合 saveDailyProgressForSync が呼ばれる", () => {
      const dailyProgress = {
        date: "2026-01-01",
        completedRoutineIds: [],
        lastResetTime: "2026-01-01T00:00:00.000Z",
      } as never;
      saveSyncDataToLocal({ dailyProgress });
      expect(routineStorage.saveDailyProgressForSync).toHaveBeenCalledWith(
        dailyProgress,
      );
    });

    it("withSyncBatch を使って一括で保存する", () => {
      saveSyncDataToLocal({});
      expect(storageCore.withSyncBatch).toHaveBeenCalledTimes(1);
    });

    it("budgetCategories を保存する", () => {
      const budgetCategories = [
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ];

      saveSyncDataToLocal({ budgetCategories });

      expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith(
        budgetCategories,
      );
    });

    it("budgetCategories が未指定の場合は空配列で保存する", () => {
      saveSyncDataToLocal({});

      expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith([]);
    });
  });

  describe("hasLocalData", () => {
    it("hasAnyLocalSyncData が true を返す場合 true を返す", () => {
      (localDataHelpers.hasAnyLocalSyncData as jest.Mock).mockReturnValue(true);
      expect(hasLocalData()).toBe(true);
    });

    it("hasAnyLocalSyncData が false を返す場合 false を返す", () => {
      (localDataHelpers.hasAnyLocalSyncData as jest.Mock).mockReturnValue(
        false,
      );
      expect(hasLocalData()).toBe(false);
    });
  });

  describe("getLocalLastModified", () => {
    it("getLocalDataUpdatedAt が 0 より大きい場合はその値を返す", () => {
      (storageCore.getLocalDataUpdatedAt as jest.Mock).mockReturnValue(88888);
      expect(getLocalLastModified()).toBe(88888);
    });

    it("getLocalDataUpdatedAt が 0 の場合は collectLatestTimestamp の結果を返す", () => {
      (storageCore.getLocalDataUpdatedAt as jest.Mock).mockReturnValue(0);
      (timestamp.collectLatestTimestamp as jest.Mock).mockReturnValue(77777);
      expect(getLocalLastModified()).toBe(77777);
    });

    it("getLocalDataUpdatedAt が 0 の場合 collectLatestTimestamp を呼ぶ", () => {
      (storageCore.getLocalDataUpdatedAt as jest.Mock).mockReturnValue(0);
      getLocalLastModified();
      expect(timestamp.collectLatestTimestamp).toHaveBeenCalledTimes(1);
    });
  });
});
