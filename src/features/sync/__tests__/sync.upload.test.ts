import {
  mockGetOrCreateUser,
  mockSetDoc,
  setupSyncTestEnvironment,
} from "./sync.test.utils";
import { uploadToFirestore } from "../sync";
import { getSyncStatus } from "../sync/statusStore";
import { SYNC_TIMEOUT_MS } from "../sync/constants";
import { getSyncedContentHash } from "../sync/syncedContentHash";
import * as syncedContentHashModule from "../sync/syncedContentHash";
import * as storageCore from "@/lib/storage/core";
import { createUploadSyncPayloadFixture } from "./sync.upload.fixtures";
import { seedSyncStorageReadMocks } from "./syncStorage.test.utils";

const uploadStorageData = createUploadSyncPayloadFixture();

// uploadStorageDataはSyncPayloadの全フィールドを含むfixtureのため、スプレッドで
// 展開することで新しいフィールドが追加された際も自動的に検証対象へ含まれる
// （手書きのフィールド列挙は、今回todoCategoriesが同期対象から漏れていた原因と
// 同じ形の見落としを再発させるため避ける）。
const expectLatestUserDocumentUploaded = (): void => {
  expect(mockSetDoc).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ path: "users/user-1", id: "user-1" }),
    expect.objectContaining({
      ...uploadStorageData,
      deviceId: expect.any(String),
      lastModified: expect.any(Number),
      updatedAt: "server-timestamp",
    }),
  );
};

const expectSnapshotDocumentUploaded = (): void => {
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
      data: expect.objectContaining({
        ...uploadStorageData,
      }),
      updatedAt: "server-timestamp",
    }),
  );
};

describe("sync upload", () => {
  beforeEach(setupSyncTestEnvironment);

  it("uploadToFirestoreが指定された同期対象をすべてFirestoreへ送信する", async () => {
    seedSyncStorageReadMocks(uploadStorageData);

    await uploadToFirestore();

    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expectLatestUserDocumentUploaded();
    expectSnapshotDocumentUploaded();

    expect(
      localStorage.getItem(storageCore.getUserScopedKey("local-data-updated-at")),
    ).not.toBeNull();
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

  it("アップロード成功後にコンテンツハッシュがユーザースコープ付きで保存される", async () => {
    await uploadToFirestore();
    // performUploadOperation 内で setCurrentUserId("user-1") が呼ばれているため取得可能
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

    try {
      await uploadToFirestore();
    } finally {
      hashSpy.mockRestore();
      tsSpy.mockRestore();
    }

    expect(callOrder.indexOf("hash")).toBeLessThan(
      callOrder.indexOf("timestamp"),
    );
  });

  it("アップロード前に migrateToUserStorage が呼ばれる", async () => {
    await uploadToFirestore();
    // migrateToUserStorage が呼ばれると user:uid:_migrated フラグが設定される
    expect(localStorage.getItem("user:user-1:_migrated")).toBe("true");
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
