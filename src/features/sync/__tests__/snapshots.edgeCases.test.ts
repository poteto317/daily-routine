import {
  mockDeleteDoc,
  mockGetDoc,
  mockGetDocs,
  mockSetDoc,
  setupSyncTestEnvironment,
} from "./sync.test.utils";
import {
  applySyncSnapshot,
  deleteSyncSnapshot,
  getSyncSnapshots,
  getSyncStatus,
  uploadToFirestore,
} from "../sync";
import { setSyncStatus } from "../sync/statusStore";
import * as routineStorage from "@/features/routine/storage";
import { createSyncSnapshotFixture } from "./sync.test.fixtures";
import {
  createExistingSyncSnapshotDocFixture,
  createSyncSnapshotDocsResultFixture,
} from "./syncSnapshot.test.fixtures";
import texts from "../locales/ja.json";

/** 新しい順に並んだ snapshot-1 〜 snapshot-{count} の一覧を返すようにする */
const mockSnapshotList = (count: number) => {
  mockGetDocs.mockResolvedValue(
    createSyncSnapshotDocsResultFixture(
      Array.from({ length: count }, (_, index) =>
        createSyncSnapshotFixture({
          id: `snapshot-${index + 1}`,
          uploadedAt: 100 - index,
          deviceId: `device-${index + 1}`,
        }),
      ),
    ) as never,
  );
};

const deletedPaths = () =>
  mockDeleteDoc.mock.calls.map(([ref]) => (ref as { path: string }).path);

describe("sync snapshots の境界と失敗時の扱い", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([]);
    (routineStorage.getDailyProgress as jest.Mock).mockReturnValue(null);
    (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue({});
  });

  describe("アップロード時の古い履歴の削除（最大 5 件）", () => {
    it("既存が 4 件なら新しい 1 件を足しても 5 件以内なので削除しない", async () => {
      mockSnapshotList(4);

      await uploadToFirestore();

      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it("既存が 6 件なら、新しい 4 件を残して 5 件目以降をすべて削除する", async () => {
      mockSnapshotList(6);

      await uploadToFirestore();

      expect(deletedPaths()).toEqual([
        "users/user-1/syncSnapshots/snapshot-5",
        "users/user-1/syncSnapshots/snapshot-6",
      ]);
    });
  });

  describe("deleteSyncSnapshot", () => {
    it("一覧に無い ID なら何も削除せず、同期中の状態を解除する", async () => {
      mockSnapshotList(2);

      await deleteSyncSnapshot("missing");

      expect(mockDeleteDoc).not.toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();
      expect(getSyncStatus()).toMatchObject({ isSyncing: false, error: null });
    });

    it("最新以外を削除しても、最新の同期データは書き換えない", async () => {
      mockSnapshotList(3);

      await deleteSyncSnapshot("snapshot-2");

      expect(deletedPaths()).toEqual(["users/user-1/syncSnapshots/snapshot-2"]);
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it("唯一の履歴を削除すると、最新の同期データ（users/{uid}）も削除する", async () => {
      mockSnapshotList(1);

      await deleteSyncSnapshot("snapshot-1");

      expect(deletedPaths()).toEqual([
        "users/user-1/syncSnapshots/snapshot-1",
        "users/user-1",
      ]);
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it("削除に失敗したら snapshot-delete-failed を投げ、エラーを状態に残す", async () => {
      mockSnapshotList(2);
      mockDeleteDoc.mockRejectedValueOnce(new Error("Firestore unavailable"));

      await expect(deleteSyncSnapshot("snapshot-2")).rejects.toMatchObject({
        name: "FirebaseError",
        code: "snapshot-delete-failed",
        message: "データベース unavailable",
      });
      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        error: "データベース unavailable",
      });
    });

    it("Error 以外の失敗は、アップロード失敗の定型文にする", async () => {
      mockGetDocs.mockRejectedValueOnce("offline");

      await expect(deleteSyncSnapshot("snapshot-1")).rejects.toMatchObject({
        code: "snapshot-delete-failed",
        message: texts.syncError.uploadFailed,
      });
    });
  });

  describe("getSyncSnapshots", () => {
    it("取得に失敗したら snapshot-list-failed を投げ、エラーを状態に残す", async () => {
      mockGetDocs.mockRejectedValueOnce("offline");

      await expect(getSyncSnapshots()).rejects.toMatchObject({
        name: "FirebaseError",
        code: "snapshot-list-failed",
        message: texts.syncError.downloadFailed,
      });
      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        error: texts.syncError.downloadFailed,
      });
    });
  });

  describe("applySyncSnapshot", () => {
    it("履歴が見つからなければローカルを変えずに snapshot-apply-failed を投げる", async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false } as never);

      await expect(applySyncSnapshot("missing")).rejects.toMatchObject({
        name: "FirebaseError",
        code: "snapshot-apply-failed",
        message: texts.syncError.noRemoteData,
      });
      expect(routineStorage.saveRoutines).not.toHaveBeenCalled();
      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        error: texts.syncError.noRemoteData,
      });
    });

    it("適用に成功したら、ローカル・リモートの変更ありの表示と前のエラーを解除する", async () => {
      setSyncStatus({
        hasRemoteChanges: true,
        hasLocalChanges: true,
        error: "前回のエラー",
        lastSyncTime: null,
      });
      mockGetDoc.mockResolvedValue(
        createExistingSyncSnapshotDocFixture({ id: "snapshot-1" }) as never,
      );

      await applySyncSnapshot("snapshot-1");

      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        hasRemoteChanges: false,
        hasLocalChanges: false,
        error: null,
      });
      expect(getSyncStatus().lastSyncTime).toEqual(expect.any(Number));
    });
  });
});
