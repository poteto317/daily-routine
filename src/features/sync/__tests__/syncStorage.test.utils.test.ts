import { setupSyncTestEnvironment } from "./sync.test.utils";
import {
  expectSyncPayloadSavedToLocal,
  expectSyncStorageReadMocksCalled,
  seedSyncStorageReadMocks,
} from "./syncStorage.test.utils";
import { collectLocalSyncData, saveSyncDataToLocal } from "../sync/localData";
import {
  createSyncPayloadFixture,
  routineFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";
import * as routineStorage from "@/features/routine/storage";
import * as todoListsStorage from "@/features/todo-lists/storage";

describe("sync storage test utils", () => {
  beforeEach(setupSyncTestEnvironment);

  it("SyncPayloadをstorage getter mockへ流し込む", () => {
    const payload = createSyncPayloadFixture({
      routines: [routineFixture],
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });

    seedSyncStorageReadMocks(payload);

    expect(routineStorage.getRoutines()).toEqual([routineFixture]);
    expect(todoListsStorage.getTodoLists()).toEqual([todoListFixture]);
    expect(todoListsStorage.getTodoCategories()).toEqual([todoCategoryFixture]);
  });

  it("SyncPayloadのstorage getter呼び出しを検証できる", () => {
    seedSyncStorageReadMocks(createSyncPayloadFixture());

    collectLocalSyncData();

    expectSyncStorageReadMocksCalled();
  });

  it("SyncPayloadがstorageへ保存されたことを検証できる", () => {
    const payload = createSyncPayloadFixture({
      dailyProgress: {
        date: "2026-02-12",
        completedRoutineIds: ["r1"],
        lastResetTime: "2026-02-12T00:00:00.000Z",
      },
      routines: [routineFixture],
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });

    saveSyncDataToLocal(payload, { skipTimestampUpdate: true });

    expectSyncPayloadSavedToLocal(payload);
  });

  it("dailyProgressがnullの場合は保存呼び出しがないことを検証できる", () => {
    const payload = createSyncPayloadFixture({ dailyProgress: null });

    saveSyncDataToLocal(payload, { skipTimestampUpdate: true });

    expectSyncPayloadSavedToLocal(payload);
  });
});
