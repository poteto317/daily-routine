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
  uploadToFirestore,
} from "../sync";
import * as routineStorage from "@/features/routine/storage";
import * as todoListsStorage from "@/features/todo-lists/storage";
import {
  createSyncSnapshotFixture,
  createSyncPayloadFixture,
  routineFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";
import {
  createExistingSyncSnapshotDocFixture,
  createSyncSnapshotDocsResultFixture,
  createTodoSyncSnapshotFixture,
} from "./syncSnapshot.test.fixtures";

describe("sync snapshots", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([]);
    (routineStorage.getDailyProgress as jest.Mock).mockReturnValue(null);
    (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue({});
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([]);
    (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([]);
  });

  it("upload 時に snapshot を積み、最大数を超えた古い履歴を削除する", async () => {
    mockGetDocs.mockResolvedValue(
      createSyncSnapshotDocsResultFixture(
        Array.from({ length: 5 }, (_, index) =>
          createSyncSnapshotFixture({
            id: `snapshot-${index + 1}`,
            uploadedAt: 10 - index,
          }),
        ),
      ) as never,
    );

    await uploadToFirestore();

    expect(mockDeleteDoc).toHaveBeenCalledWith({
      id: "snapshot-5",
      path: "users/user-1/syncSnapshots/snapshot-5",
    });
    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expect(mockSetDoc).toHaveBeenLastCalledWith(
      expect.objectContaining({
        path: "users/user-1/syncSnapshots/generated-snapshot-id",
      }),
      expect.objectContaining({
        id: "generated-snapshot-id",
        data: expect.objectContaining({ todoLists: [], todoCategories: [] }),
      }),
    );
  });

  it("snapshot 一覧を新しい順で取得する", async () => {
    mockGetDocs.mockResolvedValue(
      createSyncSnapshotDocsResultFixture([
        createSyncSnapshotFixture({
          id: "snapshot-2",
          uploadedAt: 2,
          deviceId: "device-2",
          data: createSyncPayloadFixture({
            todoCategories: [todoCategoryFixture],
          }),
        }),
        createSyncSnapshotFixture({
          id: "snapshot-1",
          uploadedAt: 1,
        }),
      ]) as never,
    );

    await expect(getSyncSnapshots()).resolves.toEqual([
      expect.objectContaining({
        id: "snapshot-2",
        uploadedAt: 2,
        data: expect.objectContaining({
          todoCategories: [todoCategoryFixture],
        }),
      }),
      expect.objectContaining({ id: "snapshot-1", uploadedAt: 1 }),
    ]);
  });

  it("snapshot を適用するとローカルへ保存する", async () => {
    mockGetDoc.mockResolvedValue(
      createExistingSyncSnapshotDocFixture({
        id: "snapshot-1",
        uploadedAt: 1,
        data: createSyncPayloadFixture({
          routines: [routineFixture],
          todoLists: [todoListFixture],
          todoCategories: [todoCategoryFixture],
        }),
      }) as never,
    );

    await applySyncSnapshot("snapshot-1");

    expect(routineStorage.saveRoutines).toHaveBeenCalledWith([
      routineFixture,
    ]);
    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith([
      todoListFixture,
    ]);
    expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([
      todoCategoryFixture,
    ]);
  });

  it("最新 snapshot を削除した場合は次の履歴を最新として更新する", async () => {
    mockGetDocs.mockResolvedValue(
      createSyncSnapshotDocsResultFixture([
        createTodoSyncSnapshotFixture(
          {
            id: "snapshot-latest",
            uploadedAt: 20,
            deviceId: "device-2",
          },
          {
            todoLists: [{ ...todoListFixture, id: "latest", title: "latest" }],
            todoCategories: [
              {
                ...todoCategoryFixture,
                id: "todo-cat-latest",
                name: "latest-category",
              },
            ],
          },
        ),
        createTodoSyncSnapshotFixture(
          {
            id: "snapshot-next",
            uploadedAt: 10,
            deviceId: "device-1",
          },
          {
            todoLists: [{ ...todoListFixture, id: "next", title: "next" }],
            todoCategories: [
              {
                ...todoCategoryFixture,
                id: "todo-cat-next",
                name: "next-category",
              },
            ],
          },
        ),
      ]) as never,
    );

    await deleteSyncSnapshot("snapshot-latest");

    expect(mockDeleteDoc).toHaveBeenCalledWith({
      id: "snapshot-latest",
      path: "users/user-1/syncSnapshots/snapshot-latest",
    });
    expect(mockSetDoc).toHaveBeenCalledWith(
      { id: "user-1", path: "users/user-1" },
      expect.objectContaining({
        lastModified: 10,
        deviceId: "device-1",
        todoLists: [expect.objectContaining({ id: "next" })],
        todoCategories: [expect.objectContaining({ id: "todo-cat-next" })],
      }),
    );
  });
});
