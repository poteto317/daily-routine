import {
  buildSyncUploadData,
  buildUploadSuccessStatus,
} from "../sync/uploadState";
import {
  createSyncPayloadFixture,
  routineFixture,
  todoCategoryFixture,
} from "./sync.test.fixtures";

describe("uploadState", () => {
  it("buildSyncUploadDataはローカルデータに同期メタデータを追加する", () => {
    const localData = createSyncPayloadFixture({
      routines: [routineFixture],
    });

    expect(
      buildSyncUploadData({
        localData,
        lastModified: 123,
        deviceId: "device-1",
      }),
    ).toEqual({
      ...localData,
      lastModified: 123,
      deviceId: "device-1",
    });
  });

  it("buildSyncUploadDataはTodoカテゴリを保持したまま同期メタデータを追加する", () => {
    const localData = createSyncPayloadFixture({
      todoCategories: [todoCategoryFixture],
    });

    expect(
      buildSyncUploadData({
        localData,
        lastModified: 123,
        deviceId: "device-1",
      }),
    ).toMatchObject({
      todoCategories: [todoCategoryFixture],
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
