import {
  mockExistingSyncDocument,
  mockMissingSyncDocument,
  mockSetDoc,
  setupSyncTestEnvironment,
} from "./sync.test.utils";
import { syncLatestData } from "../sync";
import { getSyncStatus } from "../sync/statusStore";
import * as todoListsStorage from "@/features/todo-lists/storage";
import * as routineStorage from "@/features/routine/storage";
import {
  createSyncPayloadFixture,
  createSyncDataFixture,
  routineFixture,
  todoCategoryFixture,
} from "./sync.test.fixtures";
import { seedSyncStorageReadMocks } from "./syncStorage.test.utils";

describe("sync latest", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    seedSyncStorageReadMocks(createSyncPayloadFixture());
  });

  it("syncLatestDataはクラウドが新しい場合にダウンロードを選択する", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([
      { id: "r1", title: "ローカル", updatedAt: "2026-02-12T00:00:00.000Z" },
    ]);

    const remoteData = createSyncDataFixture({
      routines: [{ ...routineFixture, id: "r2", title: "クラウド" }],
      todoCategories: [todoCategoryFixture],
      deviceId: "device-1",
      lastModified: Date.parse("2026-02-13T00:00:00.000Z"),
    });

    mockExistingSyncDocument(remoteData);
    const action = await syncLatestData();

    expect(action).toBe("downloaded");
    expect(routineStorage.saveRoutines).toHaveBeenCalledWith(
      remoteData.routines,
    );
    expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([
      todoCategoryFixture,
    ]);
  });

  it("syncLatestDataはローカルが新しい場合にアップロードを選択する", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([
      { id: "r1", title: "ローカル", updatedAt: "2026-02-14T00:00:00.000Z" },
    ]);

    mockExistingSyncDocument(
      createSyncDataFixture({
        routines: [{ ...routineFixture, id: "r2", title: "クラウド" }],
        deviceId: "device-1",
        lastModified: Date.parse("2026-02-13T00:00:00.000Z"),
      }),
    );

    const action = await syncLatestData();

    expect(action).toBe("uploaded");
    expect(mockSetDoc).toHaveBeenCalled();
  });

  it("syncLatestDataはデータがどちらにもない場合に no-data を返す", async () => {
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([]);

    mockMissingSyncDocument();

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

    mockExistingSyncDocument(
      createSyncDataFixture({
        routines: [{ ...routineFixture, id: "r2", title: "クラウド" }],
        deviceId: "device-1",
        lastModified: sharedTimestamp,
      }),
    );

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
