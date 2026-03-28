import {
  buildSyncUploadData,
  buildUploadSuccessStatus,
} from "../sync/uploadState";

const baseSettings = {
  defaultNotificationMinutes: 0,
  defaultDurationMinutes: 30,
  theme: "auto" as const,
  swipeAction: "delete" as const,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
};

describe("uploadState", () => {
  it("buildSyncUploadDataはローカルデータに同期メタデータを追加する", () => {
    expect(
      buildSyncUploadData({
        localData: {
          routines: [
            {
              id: "r1",
              title: "朝活",
              startTime: "07:00",
              duration: 30,
              category: "health",
              daysOfWeek: [1],
              isCompleted: false,
              sortOrder: 0,
              createdAt: "2026-03-12T00:00:00.000Z",
              updatedAt: "2026-03-12T00:00:00.000Z",
            },
          ],
          dailyProgress: null,
          dailyHistory: {},
          settings: baseSettings,
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
        lastModified: 123,
        deviceId: "device-1",
      }),
    ).toEqual({
      routines: [
        {
          id: "r1",
          title: "朝活",
          startTime: "07:00",
          duration: 30,
          category: "health",
          daysOfWeek: [1],
          isCompleted: false,
          sortOrder: 0,
          createdAt: "2026-03-12T00:00:00.000Z",
          updatedAt: "2026-03-12T00:00:00.000Z",
        },
      ],
      dailyProgress: null,
      dailyHistory: {},
      settings: baseSettings,
      pomodoroHistory: {},
      workSessionHistory: {},
      workTemplates: [],
      weightHistory: {},
      journalHistory: {},
      budgetData: { budgets: {}, expenses: {} },
      mealHistory: {},
      presets: [],
      todoLists: [],
      lastModified: 123,
      deviceId: "device-1",
    });
  });

  it("buildUploadSuccessStatusは同期完了状態を返す", () => {
    expect(
      buildUploadSuccessStatus({
        syncedAt: 123,
        lastSyncTime: 456,
      }),
    ).toEqual({
      isSyncing: false,
      lastSyncTime: 456,
      localLastModified: 123,
      remoteLastModified: 123,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });
});
