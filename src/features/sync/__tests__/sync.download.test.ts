import {
  mockExistingSyncDocument,
  mockGetOrCreateUser,
  mockMissingSyncDocument,
  setupSyncTestEnvironment,
} from "./sync.test.utils";
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
import * as workoutTrackerStorage from "@/features/workout-tracker/storage";
import * as workTrackerStorage from "@/features/work-tracker/storage";
import {
  createSyncDataFixture,
  routineFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";
import { expectSyncPayloadSavedToLocal } from "./syncStorage.test.utils";

describe("sync download", () => {
  beforeEach(setupSyncTestEnvironment);

  it("downloadFromFirestoreが指定された同期対象をすべてローカルへ復元する", async () => {
    const remoteData = createSyncDataFixture({
      routines: [routineFixture],
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
      pomodoroHistory: {
        "2026-02-12": { date: "2026-02-12", completedPomodoros: 3 },
      },
      budgetData: {
        expenses: {
          "2026-02": [
            {
              id: "e1",
              date: "2026-02-12",
              amount: 1200,
              createdAt: "2026-02-12T00:00:00.000Z",
            },
          ],
        },
      },
      budgetCategories: [
        { id: "cat-1", name: "食料品", createdAt: "2026-02-01T00:00:00.000Z" },
      ],
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
      deviceId: "device-1",
      lastModified: Date.now(),
    });

    mockExistingSyncDocument(remoteData);
    await downloadFromFirestore({ reload: false });

    expectSyncPayloadSavedToLocal(remoteData);
  });

  it("downloadFromFirestoreは欠損項目にデフォルト値を適用して復元する", async () => {
    mockExistingSyncDocument({
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
    });

    await downloadFromFirestore({ reload: false });

    expect(routineStorage.saveDailyProgressForSync).not.toHaveBeenCalled();
    expect(pomodoroStorage.savePomodoroHistory).toHaveBeenCalledWith({});
    expect(workTrackerStorage.saveWorkSessionHistory).toHaveBeenCalledWith({});
    expect(workTrackerStorage.saveWorkTemplates).toHaveBeenCalledWith([]);
    expect(weightTrackerStorage.saveWeightHistory).toHaveBeenCalledWith({});
    expect(
      workoutTrackerStorage.saveWorkoutRecordHistory,
    ).toHaveBeenCalledWith({});
    expect(journalStorage.saveJournalHistory).toHaveBeenCalledWith({});
    expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith({
      expenses: {},
    });
    expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith([]);
    expect(budgetStorage.saveBudgetIncomeItems).toHaveBeenCalledWith([]);
    expect(budgetStorage.saveBudgetExpenseItems).toHaveBeenCalledWith([]);
    expect(mealStorage.saveMealHistory).toHaveBeenCalledWith({});
    expect(presetStorage.savePresets).toHaveBeenCalledWith([]);
    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith([]);
    expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([]);
  });

  it("downloadFromFirestoreはリモートデータが存在しない場合に失敗する", async () => {
    mockMissingSyncDocument();

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
    mockExistingSyncDocument(remoteData);

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
    mockExistingSyncDocument(remoteData);

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

    mockExistingSyncDocument({
      routines: [],
      deviceId: "device-1",
      lastModified: Date.now(),
    });

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
    mockExistingSyncDocument({
      routines: [],
      deviceId: "device-1",
      lastModified: Date.now(),
    });

    await downloadFromFirestore({ reload: false });

    // migrateToUserStorage が呼ばれると user:uid:_migrated フラグが設定される
    expect(localStorage.getItem("user:user-1:_migrated")).toBe("true");
  });

  it("setLocalDataUpdatedAt に extractTimestamp 済みの number が渡される", async () => {
    const lastModifiedStr = "2026-01-01T00:00:00.000Z";
    const expectedMs = Date.parse(lastModifiedStr);

    mockExistingSyncDocument({
      routines: [],
      deviceId: "device-1",
      lastModified: lastModifiedStr,
    });

    await downloadFromFirestore({ reload: false });

    // setLocalDataUpdatedAt が extractTimestamp 済みの number で呼ばれることを
    // localStorage への書き込み副作用で確認（文字列のまま渡ると NaN になる）
    const stored = localStorage.getItem(storageCore.getUserScopedKey("local-data-updated-at"));
    expect(stored).toBe(String(expectedMs));
  });

  it("ダウンロード成功後に localLastModified と remoteLastModified をリモートのタイムスタンプで設定する", async () => {
    const lastModified = 1700000000000;
    const remoteData = {
      routines: [],
      deviceId: "device-1",
      lastModified,
    };
    mockExistingSyncDocument(remoteData);

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
    mockExistingSyncDocument(remoteData);

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
    mockExistingSyncDocument(remoteData);

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
