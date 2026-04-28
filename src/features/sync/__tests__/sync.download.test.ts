import { mockGetDoc, mockGetOrCreateUser, setupSyncTestEnvironment } from "./sync.test.utils";
import { downloadFromFirestore } from "../sync";
import { getSyncStatus } from "../sync/statusStore";
import { SYNC_TIMEOUT_MS } from "../sync/constants";
import { getSyncedContentHash } from "../sync/syncedContentHash";
import * as syncedContentHashModule from "../sync/syncedContentHash";
import * as storageCore from "@/lib/storage/core";
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

describe("sync download", () => {
  beforeEach(setupSyncTestEnvironment);

  it("downloadFromFirestoreが指定された同期対象をすべてローカルへ復元する", async () => {
    const remoteData = {
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
      deviceId: "device-1",
      lastModified: Date.now(),
    };

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);
    await downloadFromFirestore({ reload: false });

    expect(routineStorage.saveRoutines).toHaveBeenCalledWith(
      remoteData.routines,
    );
    expect(routineStorage.saveDailyProgressForSync).toHaveBeenCalledWith(
      remoteData.dailyProgress,
    );
    expect(routineStorage.saveMonthlyHistory).toHaveBeenCalledWith(
      remoteData.dailyHistory,
    );
    expect(settingsStorage.saveSettings).toHaveBeenCalledWith(
      remoteData.settings,
    );
    expect(pomodoroStorage.savePomodoroHistory).toHaveBeenCalledWith(
      remoteData.pomodoroHistory,
    );
    expect(workTrackerStorage.saveWorkSessionHistory).toHaveBeenCalledWith(
      remoteData.workSessionHistory,
    );
    expect(workTrackerStorage.saveWorkTemplates).toHaveBeenCalledWith(
      remoteData.workTemplates,
    );
    expect(weightTrackerStorage.saveWeightHistory).toHaveBeenCalledWith(
      remoteData.weightHistory,
    );
    expect(journalStorage.saveJournalHistory).toHaveBeenCalledWith(
      remoteData.journalHistory,
    );
    expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith(
      remoteData.budgetData,
    );
    expect(mealStorage.saveMealHistory).toHaveBeenCalledWith(
      remoteData.mealHistory,
    );
    expect(presetStorage.savePresets).toHaveBeenCalledWith(remoteData.presets);
    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith(
      remoteData.todoLists,
    );
  });

  it("downloadFromFirestoreは欠損項目にデフォルト値を適用して復元する", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        routines: [{ id: "r1", title: "朝活" }],
        dailyHistory: {
          "2026-02-12": {
            date: "2026-02-12",
            completedRoutineIds: ["r1"],
            routineSnapshots: [],
          },
        },
        settings: { theme: "auto" },
        deviceId: "device-1",
        lastModified: Date.now(),
      }),
    } as never);

    await downloadFromFirestore({ reload: false });

    expect(routineStorage.saveDailyProgressForSync).not.toHaveBeenCalled();
    expect(pomodoroStorage.savePomodoroHistory).toHaveBeenCalledWith({});
    expect(workTrackerStorage.saveWorkSessionHistory).toHaveBeenCalledWith({});
    expect(workTrackerStorage.saveWorkTemplates).toHaveBeenCalledWith([]);
    expect(weightTrackerStorage.saveWeightHistory).toHaveBeenCalledWith({});
    expect(journalStorage.saveJournalHistory).toHaveBeenCalledWith({});
    expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {},
    });
    expect(mealStorage.saveMealHistory).toHaveBeenCalledWith({});
    expect(presetStorage.savePresets).toHaveBeenCalledWith([]);
    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith([]);
  });

  it("downloadFromFirestoreはリモートデータが存在しない場合に失敗する", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false } as never);

    await expect(
      downloadFromFirestore({ reload: false }),
    ).rejects.toMatchObject({
      code: "download-failed",
    });

    expect(routineStorage.saveRoutines).not.toHaveBeenCalled();
    expect(routineStorage.saveMonthlyHistory).not.toHaveBeenCalled();
    expect(settingsStorage.saveSettings).not.toHaveBeenCalled();
  });

  it("ダウンロード成功後に isSyncing: false・hasRemoteChanges: false のステータスを設定する", async () => {
    const remoteData = {
      routines: [],
      deviceId: "device-1",
      lastModified: Date.now(),
    };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);

    await downloadFromFirestore({ reload: false });

    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  });

  it("ダウンロード成功後にコンテンツハッシュがユーザースコープ付きで保存される", async () => {
    const remoteData = {
      routines: [],
      deviceId: "device-1",
      lastModified: Date.now(),
    };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);

    await downloadFromFirestore({ reload: false });
    // performDownloadOperation 内で setCurrentUserId("user-1") が呼ばれているため取得可能
    expect(getSyncedContentHash()).not.toBeNull();
  });

  it("saveSyncedContentHash が setLocalDataUpdatedAt より前に呼ばれる", async () => {
    const callOrder: string[] = [];
    const hashSpy = jest
      .spyOn(syncedContentHashModule, "saveSyncedContentHash")
      .mockImplementation(() => {
        callOrder.push("hash");
      });
    const tsSpy = jest
      .spyOn(storageCore, "setLocalDataUpdatedAt")
      .mockImplementation(() => {
        callOrder.push("timestamp");
      });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ routines: [], deviceId: "device-1", lastModified: Date.now() }),
    } as never);

    try {
      await downloadFromFirestore({ reload: false });
    } finally {
      hashSpy.mockRestore();
      tsSpy.mockRestore();
    }

    expect(callOrder.indexOf("hash")).toBeLessThan(
      callOrder.indexOf("timestamp"),
    );
  });

  it("ダウンロード前に migrateToUserStorage が呼ばれる", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ routines: [], deviceId: "device-1", lastModified: Date.now() }),
    } as never);

    await downloadFromFirestore({ reload: false });

    // migrateToUserStorage が呼ばれると user:uid:_migrated フラグが設定される
    expect(localStorage.getItem("user:user-1:_migrated")).toBe("true");
  });

  it("setLocalDataUpdatedAt に extractTimestamp 済みの number が渡される", async () => {
    const lastModifiedStr = "2026-01-01T00:00:00.000Z";
    const expectedMs = Date.parse(lastModifiedStr);

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ routines: [], deviceId: "device-1", lastModified: lastModifiedStr }),
    } as never);

    await downloadFromFirestore({ reload: false });

    // setLocalDataUpdatedAt が extractTimestamp 済みの number で呼ばれることを
    // localStorage への書き込み副作用で確認（文字列のまま渡ると NaN になる）
    const stored = localStorage.getItem("user:user-1:local-data-updated-at");
    expect(stored).toBe(String(expectedMs));
  });

  it("ダウンロード成功後に localLastModified と remoteLastModified をリモートのタイムスタンプで設定する", async () => {
    const lastModified = 1700000000000;
    const remoteData = {
      routines: [],
      deviceId: "device-1",
      lastModified,
    };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);

    await downloadFromFirestore({ reload: false });

    expect(getSyncStatus()).toMatchObject({
      localLastModified: lastModified,
      remoteLastModified: lastModified,
    });
  });

  it("リモートのタイムスタンプが 0 の場合は localLastModified / remoteLastModified を null にする", async () => {
    const remoteData = {
      routines: [],
      deviceId: "device-1",
      lastModified: 0,
    };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);

    await downloadFromFirestore({ reload: false });

    expect(getSyncStatus()).toMatchObject({
      localLastModified: null,
      remoteLastModified: null,
    });
  });

  it("ダウンロード完了時に sync-status-changed イベントを 1 回だけ発火する", async () => {
    const remoteData = {
      routines: [],
      deviceId: "device-1",
      lastModified: Date.now(),
    };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => remoteData,
    } as never);

    const handler = jest.fn();
    window.addEventListener("sync-status-changed", handler);

    await downloadFromFirestore({ reload: false });

    // isSyncing: true の設定（開始時）と isSyncing: false の設定（完了時）の 2 回のみ
    expect(handler).toHaveBeenCalledTimes(2);
    window.removeEventListener("sync-status-changed", handler);
  });

  it("Firebase操作がタイムアウトした場合に isSyncing を false にリセットする", async () => {
    jest.useFakeTimers();
    try {
      // 永遠に解決しない Promise を返す
      mockGetOrCreateUser.mockReturnValue(new Promise(() => {}));

      const promise = downloadFromFirestore({ reload: false });
      jest.advanceTimersByTime(SYNC_TIMEOUT_MS + 100);

      await expect(promise).rejects.toMatchObject({ code: "download-failed" });
      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        error: expect.stringContaining("タイムアウト"),
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
