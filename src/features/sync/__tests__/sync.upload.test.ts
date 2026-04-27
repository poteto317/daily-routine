import { mockSetDoc, mockGetOrCreateUser, setupSyncTestEnvironment } from "./sync.test.utils";
import { uploadToFirestore } from "../sync";
import { getSyncStatus } from "../sync/statusStore";
import { SYNC_TIMEOUT_MS } from "../sync/constants";
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

describe("sync upload", () => {
  beforeEach(setupSyncTestEnvironment);

  it("uploadToFirestoreが指定された同期対象をすべてFirestoreへ送信する", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([
      { id: "r1", title: "朝活" },
    ]);
    (routineStorage.getDailyProgress as jest.Mock).mockReturnValue({
      date: "2026-02-12",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-02-12T00:00:00.000Z",
    });
    (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue({
      "2026-02-12": {
        date: "2026-02-12",
        completedRoutineIds: ["r1"],
        routineSnapshots: [],
      },
    });
    (settingsStorage.getSettings as jest.Mock).mockReturnValue({
      theme: "auto",
    });
    (pomodoroStorage.getPomodoroHistory as jest.Mock).mockReturnValue({
      "2026-02-12": { date: "2026-02-12", completedPomodoros: 3 },
    });
    (workTrackerStorage.getWorkSessionHistory as jest.Mock).mockReturnValue({
      "2026-02-12": [{ id: "w1" }],
    });
    (workTrackerStorage.getWorkTemplates as jest.Mock).mockReturnValue([
      { id: "t1", name: "開発" },
    ]);
    (weightTrackerStorage.getWeightHistory as jest.Mock).mockReturnValue({
      "2026-02-12": { id: "we1", date: "2026-02-12", weight: 65 },
    });
    (journalStorage.getJournalHistory as jest.Mock).mockReturnValue({
      "2026-02-12": {
        id: "j1",
        date: "2026-02-12",
        title: "title",
        content: "content",
      },
    });
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue({
      budgets: {
        "2026-02": { id: "b1", month: "2026-02", totalAmount: 50000 },
      },
      expenses: { "2026-02": [{ id: "e1", date: "2026-02-12", amount: 1200 }] },
    });
    (mealStorage.getMealHistory as jest.Mock).mockReturnValue({
      "2026-02-12": [
        {
          id: "m1",
          date: "2026-02-12",
          mealType: "lunch",
          time: "12:00",
          description: "定食",
        },
      ],
    });
    (presetStorage.getPresets as jest.Mock).mockReturnValue([
      { id: "p1", name: "平日セット", routineTemplates: [] },
    ]);
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([
      {
        id: "list-1",
        title: "ショッピング",
        items: [],
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    ]);

    await uploadToFirestore();

    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expect(mockSetDoc).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ path: "users/user-1", id: "user-1" }),
      expect.objectContaining({
        routines: [{ id: "r1", title: "朝活" }],
        dailyProgress: {
          date: "2026-02-12",
          completedRoutineIds: ["r1"],
          lastResetTime: "2026-02-12T00:00:00.000Z",
        },
        dailyHistory: {
          "2026-02-12": {
            date: "2026-02-12",
            completedRoutineIds: ["r1"],
            routineSnapshots: [],
          },
        },
        settings: { theme: "auto" },
        pomodoroHistory: {
          "2026-02-12": { date: "2026-02-12", completedPomodoros: 3 },
        },
        workSessionHistory: { "2026-02-12": [{ id: "w1" }] },
        workTemplates: [{ id: "t1", name: "開発" }],
        weightHistory: {
          "2026-02-12": { id: "we1", date: "2026-02-12", weight: 65 },
        },
        journalHistory: {
          "2026-02-12": {
            id: "j1",
            date: "2026-02-12",
            title: "title",
            content: "content",
          },
        },
        budgetData: {
          budgets: {
            "2026-02": { id: "b1", month: "2026-02", totalAmount: 50000 },
          },
          expenses: {
            "2026-02": [{ id: "e1", date: "2026-02-12", amount: 1200 }],
          },
        },
        mealHistory: {
          "2026-02-12": [
            {
              id: "m1",
              date: "2026-02-12",
              mealType: "lunch",
              time: "12:00",
              description: "定食",
            },
          ],
        },
        presets: [{ id: "p1", name: "平日セット", routineTemplates: [] }],
        todoLists: [
          {
            id: "list-1",
            title: "ショッピング",
            items: [],
            createdAt: "2026-02-12T00:00:00.000Z",
            updatedAt: "2026-02-12T00:00:00.000Z",
          },
        ],
        deviceId: expect.any(String),
        lastModified: expect.any(Number),
        updatedAt: "server-timestamp",
      }),
    );
    expect(mockSetDoc).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        path: "users/user-1/syncSnapshots/generated-snapshot-id",
        id: "generated-snapshot-id",
      }),
      expect.objectContaining({
        id: "generated-snapshot-id",
        uploadedAt: expect.any(Number),
        deviceId: expect.any(String),
        data: {
          routines: [{ id: "r1", title: "朝活" }],
          dailyProgress: {
            date: "2026-02-12",
            completedRoutineIds: ["r1"],
            lastResetTime: "2026-02-12T00:00:00.000Z",
          },
          dailyHistory: {
            "2026-02-12": {
              date: "2026-02-12",
              completedRoutineIds: ["r1"],
              routineSnapshots: [],
            },
          },
          settings: { theme: "auto" },
          pomodoroHistory: {
            "2026-02-12": { date: "2026-02-12", completedPomodoros: 3 },
          },
          workSessionHistory: { "2026-02-12": [{ id: "w1" }] },
          workTemplates: [{ id: "t1", name: "開発" }],
          weightHistory: {
            "2026-02-12": { id: "we1", date: "2026-02-12", weight: 65 },
          },
          journalHistory: {
            "2026-02-12": {
              id: "j1",
              date: "2026-02-12",
              title: "title",
              content: "content",
            },
          },
          budgetData: {
            budgets: {
              "2026-02": { id: "b1", month: "2026-02", totalAmount: 50000 },
            },
            expenses: {
              "2026-02": [{ id: "e1", date: "2026-02-12", amount: 1200 }],
            },
          },
          mealHistory: {
            "2026-02-12": [
              {
                id: "m1",
                date: "2026-02-12",
                mealType: "lunch",
                time: "12:00",
                description: "定食",
              },
            ],
          },
          presets: [{ id: "p1", name: "平日セット", routineTemplates: [] }],
          todoLists: [
            {
              id: "list-1",
              title: "ショッピング",
              items: [],
              createdAt: "2026-02-12T00:00:00.000Z",
              updatedAt: "2026-02-12T00:00:00.000Z",
            },
          ],
        },
        updatedAt: "server-timestamp",
      }),
    );

    expect(localStorage.getItem("local-data-updated-at")).not.toBeNull();
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });

  it("アップロード成功後に isSyncing: false・hasLocalChanges: false のステータスを設定する", async () => {
    await uploadToFirestore();

    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });

  it("Firebase操作がタイムアウトした場合に isSyncing を false にリセットする", async () => {
    jest.useFakeTimers();
    try {
      // 永遠に解決しない Promise を返す
      mockGetOrCreateUser.mockReturnValue(new Promise(() => {}));

      const promise = uploadToFirestore();
      jest.advanceTimersByTime(SYNC_TIMEOUT_MS + 100);

      await expect(promise).rejects.toMatchObject({ code: "upload-failed" });
      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        error: expect.stringContaining("タイムアウト"),
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
