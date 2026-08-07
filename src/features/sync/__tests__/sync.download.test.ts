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
import * as journalStorage from "@/features/journal/storage";
import * as presetStorage from "@/features/preset/storage";
import * as routineStorage from "@/features/routine/storage";
import * as settingsStorage from "@/features/settings/storage";
import * as workoutTrackerStorage from "@/features/workout-tracker/storage";
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

  it("downloadFromFirestoreはリモートに存在しない項目のローカルデータを保持する", async () => {
    // リモートに項目が存在しないのは、その機能を知らない古いバージョンの端末が
    // アップロードした場合がある。空の既定値で上書きするとローカルデータを
    // 消してしまうため、欠損時はローカルの値を維持する。
    const localWorkouts = {
      "2026-02-12": [{ id: "w1", title: "腕立て" }],
    };
    const localPresets = [{ id: "p1", name: "朝ルーティン" }];
    const localJournal = { "2026-02-12": [{ id: "j1", content: "メモ" }] };

    (workoutTrackerStorage.getWorkoutRecordHistory as jest.Mock).mockReturnValue(
      localWorkouts,
    );
    (presetStorage.getPresets as jest.Mock).mockReturnValue(localPresets);
    (journalStorage.getJournalHistory as jest.Mock).mockReturnValue(
      localJournal,
    );

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
    expect(
      workoutTrackerStorage.saveWorkoutRecordHistory,
    ).toHaveBeenCalledWith(localWorkouts);
    expect(presetStorage.savePresets).toHaveBeenCalledWith(localPresets);
    expect(journalStorage.saveJournalHistory).toHaveBeenCalledWith(localJournal);
  });

  it("dailyProgressがnullでもローカルの当日の完了状況を消さない", async () => {
    // 他フィールドと異なり、dailyProgressのnullは「ユーザーが全削除した」ではなく
    // 「その日まだ何も完了していない」を意味する（getDailyProgressは記録が無いとき
    // nullを返す）。これを尊重して上書きすると、他端末で記録済みの当日の完了状況を
    // 消してしまうため、null/undefinedのどちらもローカルを維持する。
    mockExistingSyncDocument({
      routines: [],
      dailyProgress: null,
      deviceId: "device-1",
      lastModified: Date.now(),
    });

    await downloadFromFirestore({ reload: false });

    expect(routineStorage.saveDailyProgressForSync).not.toHaveBeenCalled();
  });

  it("downloadFromFirestoreはリモートが明示的に空の項目はそのまま反映する", async () => {
    // ユーザーが全削除した結果としての空配列/空オブジェクトは尊重する。
    (workoutTrackerStorage.getWorkoutRecordHistory as jest.Mock).mockReturnValue(
      { "2026-02-12": [{ id: "w1" }] },
    );
    (presetStorage.getPresets as jest.Mock).mockReturnValue([{ id: "p1" }]);

    mockExistingSyncDocument({
      routines: [],
      workoutRecordHistory: {},
      presets: [],
      deviceId: "device-1",
      lastModified: Date.now(),
    });

    await downloadFromFirestore({ reload: false });

    expect(
      workoutTrackerStorage.saveWorkoutRecordHistory,
    ).toHaveBeenCalledWith({});
    expect(presetStorage.savePresets).toHaveBeenCalledWith([]);
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
