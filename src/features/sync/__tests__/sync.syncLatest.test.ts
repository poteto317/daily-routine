import {
  mockGetDoc,
  mockSetDoc,
  setupSyncTestEnvironment,
} from "./sync.test.utils";
import { syncLatestData } from "../sync";
import { getSyncStatus } from "../sync/statusStore";
import * as budgetStorage from "@/features/budget/storage";
import * as journalStorage from "@/features/journal/storage";
import * as mealStorage from "@/features/meal/storage";
import * as pomodoroStorage from "@/features/pomodoro/storage";
import * as presetStorage from "@/features/preset/storage";
import * as todoListsStorage from "@/features/todo-lists/storage";
import * as routineStorage from "@/features/routine/storage";
import * as settingsStorage from "@/features/settings/storage";
import * as weightTrackerStorage from "@/features/weight-tracker/storage";
import * as workTrackerStorage from "@/features/work-tracker/storage";

const setCommonStorages = (): void => {
  (routineStorage.getDailyProgress as jest.Mock).mockReturnValue(null);
  (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue({});
  (settingsStorage.getSettings as jest.Mock).mockReturnValue({});
  (pomodoroStorage.getPomodoroHistory as jest.Mock).mockReturnValue({});
  (workTrackerStorage.getWorkSessionHistory as jest.Mock).mockReturnValue({});
  (workTrackerStorage.getWorkTemplates as jest.Mock).mockReturnValue([]);
  (weightTrackerStorage.getWeightHistory as jest.Mock).mockReturnValue({});
  (journalStorage.getJournalHistory as jest.Mock).mockReturnValue({});
  (budgetStorage.getBudgetData as jest.Mock).mockReturnValue({
    expenses: {},
  });
  (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue([]);
  (budgetStorage.getBudgetIncomeItems as jest.Mock).mockReturnValue([]);
  (budgetStorage.getBudgetExpenseItems as jest.Mock).mockReturnValue([]);
  (mealStorage.getMealHistory as jest.Mock).mockReturnValue({});
  (presetStorage.getPresets as jest.Mock).mockReturnValue([]);
  (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([]);
};

describe("sync latest", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    setCommonStorages();
  });

  it("syncLatestDataはクラウドが新しい場合にダウンロードを選択する", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([
      { id: "r1", title: "ローカル", updatedAt: "2026-02-12T00:00:00.000Z" },
    ]);

    const remoteData = {
      routines: [{ id: "r2", title: "クラウド" }],
      dailyHistory: {},
      settings: {},
      pomodoroHistory: {},
      workSessionHistory: {},
      workTemplates: [],
      weightHistory: {},
      journalHistory: {},
      budgetData: { expenses: {} },
      mealHistory: {},
      presets: [],
      deviceId: "device-1",
      lastModified: Date.parse("2026-02-13T00:00:00.000Z"),
    };

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);
    const action = await syncLatestData();

    expect(action).toBe("downloaded");
    expect(routineStorage.saveRoutines).toHaveBeenCalledWith(
      remoteData.routines,
    );
  });

  it("syncLatestDataはローカルが新しい場合にアップロードを選択する", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([
      { id: "r1", title: "ローカル", updatedAt: "2026-02-14T00:00:00.000Z" },
    ]);

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        routines: [{ id: "r2", title: "クラウド" }],
        dailyHistory: {},
        settings: {},
        pomodoroHistory: {},
        workSessionHistory: {},
        workTemplates: [],
        weightHistory: {},
        journalHistory: {},
        budgetData: { expenses: {} },
        mealHistory: {},
        presets: [],
        deviceId: "device-1",
        lastModified: Date.parse("2026-02-13T00:00:00.000Z"),
      }),
    } as never);

    const action = await syncLatestData();

    expect(action).toBe("uploaded");
    expect(mockSetDoc).toHaveBeenCalled();
  });

  it("syncLatestDataはデータがどちらにもない場合に no-data を返す", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([]);

    mockGetDoc.mockResolvedValue({
      exists: () => false,
    } as never);

    const action = await syncLatestData();

    expect(action).toBe("no-data");
    expect(mockSetDoc).not.toHaveBeenCalled();
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });

  it("syncLatestDataは更新時刻が同じ場合に up-to-date を返す", async () => {
    const sharedTimestamp = Date.parse("2026-02-13T00:00:00.000Z");

    (routineStorage.getRoutines as jest.Mock).mockReturnValue([
      { id: "r1", title: "ローカル", updatedAt: "2026-02-13T00:00:00.000Z" },
    ]);

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        routines: [{ id: "r2", title: "クラウド" }],
        dailyHistory: {},
        settings: {},
        pomodoroHistory: {},
        workSessionHistory: {},
        workTemplates: [],
        weightHistory: {},
        journalHistory: {},
        budgetData: { expenses: {} },
        mealHistory: {},
        presets: [],
        todoLists: [],
        deviceId: "device-1",
        lastModified: sharedTimestamp,
      }),
    } as never);

    const action = await syncLatestData();

    expect(action).toBe("up-to-date");
    expect(mockSetDoc).not.toHaveBeenCalled();
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      localLastModified: sharedTimestamp,
      remoteLastModified: sharedTimestamp,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });
});
