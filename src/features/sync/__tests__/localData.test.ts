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
jest.mock("@/features/workout-tracker/storage", () => ({
  getWorkoutRecordHistory: jest.fn(() => ({})),
  saveWorkoutRecordHistory: jest.fn(),
}));
jest.mock("@/features/journal/storage", () => ({
  getJournalHistory: jest.fn(() => ({})),
  saveJournalHistory: jest.fn(),
}));
jest.mock("@/features/budget/storage", () => ({
  getBudgetData: jest.fn(() => ({ expenses: {} })),
  saveBudgetData: jest.fn(),
  getBudgetCategories: jest.fn(() => []),
  saveBudgetCategories: jest.fn(),
  getBudgetIncomeItems: jest.fn(() => []),
  saveBudgetIncomeItems: jest.fn(),
  getBudgetExpenseItems: jest.fn(() => []),
  saveBudgetExpenseItems: jest.fn(),
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
  getTodoCategories: jest.fn(() => []),
  saveTodoCategories: jest.fn(),
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
import * as budgetStorage from "@/features/budget/storage";
import * as todoListsStorage from "@/features/todo-lists/storage";
import * as storageCore from "@/lib/storage/core";
import * as localDataHelpers from "../sync/localDataHelpers";
import * as timestamp from "../sync/timestamp";
import {
  budgetCategoryFixture,
  budgetExpenseItemFixture,
  budgetIncomeItemFixture,
  createSyncPayloadFixture,
  routineFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";
import {
  expectSyncStorageReadMocksCalled,
  seedSyncStorageReadMocks,
} from "./syncStorage.test.utils";

const resetLocalDataStorageMocks = (): void => {
  seedSyncStorageReadMocks(createSyncPayloadFixture());
  (storageCore.getLocalDataUpdatedAt as jest.Mock).mockReturnValue(0);
  (localDataHelpers.hasAnyLocalSyncData as jest.Mock).mockReturnValue(false);
  (timestamp.collectLatestTimestamp as jest.Mock).mockReturnValue(9999);
};

const collectLocalSyncDataStorageFixture = createSyncPayloadFixture({
  routines: [routineFixture],
  settings: {
    ...createSyncPayloadFixture().settings,
    theme: "dark",
  },
  presets: [{ id: "p1" } as never],
  budgetCategories: [budgetCategoryFixture],
  budgetIncomeItems: [budgetIncomeItemFixture],
  budgetExpenseItems: [budgetExpenseItemFixture],
  todoLists: [todoListFixture],
  todoCategories: [todoCategoryFixture],
});

describe("localData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetLocalDataStorageMocks();
  });

  describe("collectLocalSyncData", () => {
    it("各ストレージから値を収集してオブジェクトを返す", () => {
      seedSyncStorageReadMocks(collectLocalSyncDataStorageFixture);

      const result = collectLocalSyncData();

      expect(result.routines).toEqual([routineFixture]);
      expect(result.settings).toEqual(collectLocalSyncDataStorageFixture.settings);
      expect(result.presets).toEqual([{ id: "p1" }]);
      expect(result.budgetCategories).toEqual([budgetCategoryFixture]);
      expect(result.budgetIncomeItems).toEqual([budgetIncomeItemFixture]);
      expect(result.budgetExpenseItems).toEqual([budgetExpenseItemFixture]);
      expect(result.todoLists).toEqual([todoListFixture]);
      expect(result.todoCategories).toEqual([todoCategoryFixture]);
    });

    it("全ストレージ getter を呼び出す", () => {
      collectLocalSyncData();

      expectSyncStorageReadMocksCalled();
    });
  });

  describe("saveSyncDataToLocal", () => {
    it("各ストレージ setter を呼び出す", () => {
      const routines = [{ id: "r1" }] as never[];
      const settings = { theme: "dark" as const } as never;

      saveSyncDataToLocal({ routines, settings, lastModified: 12345 });

      expect(routineStorage.saveRoutines).toHaveBeenCalledWith(routines);
      // settingsは丸ごと置き換えず、ローカルへ上書きマージする。
      // 古いバージョンが送ったsettingsで新しい設定項目のユーザー値が
      // 失われるのを防ぐため。
      expect(settingsStorage.saveSettings).toHaveBeenCalledWith({
        ...createSyncPayloadFixture().settings,
        theme: "dark",
      });
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
      const budgetData = { expenses: { "2026-02": [] } };

      saveSyncDataToLocal({
        budgetData,
        budgetCategories: [budgetCategoryFixture],
        budgetIncomeItems: [budgetIncomeItemFixture],
        budgetExpenseItems: [budgetExpenseItemFixture],
      });

      expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith(budgetData);
      expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith(
        [budgetCategoryFixture],
      );
      expect(budgetStorage.saveBudgetIncomeItems).toHaveBeenCalledWith(
        [budgetIncomeItemFixture],
      );
      expect(budgetStorage.saveBudgetExpenseItems).toHaveBeenCalledWith(
        [budgetExpenseItemFixture],
      );
    });

    it("予算データが未指定の場合はデフォルト値で保存する", () => {
      saveSyncDataToLocal({});

      expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith({
        expenses: {},
      });
      expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith([]);
      expect(budgetStorage.saveBudgetIncomeItems).toHaveBeenCalledWith([]);
      expect(budgetStorage.saveBudgetExpenseItems).toHaveBeenCalledWith([]);
    });

    it("Todoリスト同期データを保存する", () => {
      saveSyncDataToLocal({
        todoLists: [todoListFixture],
        todoCategories: [todoCategoryFixture],
      });

      expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith([
        todoListFixture,
      ]);
      expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([
        todoCategoryFixture,
      ]);
    });

    it("todoCategoriesフィールド自体が無い（本フィールド追加前のクラウドデータ）場合、既存のローカルカテゴリを削除せず保持する", () => {
      (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([
        todoCategoryFixture,
      ]);

      saveSyncDataToLocal({ todoLists: [todoListFixture] });

      expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([
        todoCategoryFixture,
      ]);
    });

    it("todoCategoriesが明示的に空配列の場合はローカルカテゴリを空にする（ユーザーによる削除を正しく反映する）", () => {
      (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([
        todoCategoryFixture,
      ]);

      saveSyncDataToLocal({ todoLists: [todoListFixture], todoCategories: [] });

      expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([]);
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
