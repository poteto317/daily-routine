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

describe("sync snapshots", () => {
  beforeEach(() => {
    setupSyncTestEnvironment();
    (routineStorage.getRoutines as jest.Mock).mockReturnValue([]);
    (routineStorage.getDailyProgress as jest.Mock).mockReturnValue(null);
    (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue({});
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([]);
  });

  it("upload 時に snapshot を積み、最大数を超えた古い履歴を削除する", async () => {
    mockGetDocs.mockResolvedValue({
      docs: Array.from({ length: 5 }, (_, index) => ({
        id: `snapshot-${index + 1}`,
        data: () => ({
          uploadedAt: 10 - index,
          deviceId: "device-1",
          data: {
            routines: [],
            dailyProgress: null,
            dailyHistory: {},
            settings: {},
            pomodoroHistory: {},
            workSessionHistory: {},
            workTemplates: [],
            weightHistory: {},
            journalHistory: {},
            budgetData: { budgets: {}, expenses: {} },
            mealHistory: {},
            presets: [],
            todoLists: [],
          },
        }),
      })),
    } as never);

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
        data: expect.objectContaining({ todoLists: [] }),
      }),
    );
  });

  it("snapshot 一覧を新しい順で取得する", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "snapshot-2",
          data: () => ({
            uploadedAt: 2,
            deviceId: "device-2",
            data: {
              routines: [],
              dailyProgress: null,
              dailyHistory: {},
              settings: {},
              pomodoroHistory: {},
              workSessionHistory: {},
              workTemplates: [],
              weightHistory: {},
              journalHistory: {},
              budgetData: { budgets: {}, expenses: {} },
              mealHistory: {},
              presets: [],
              todoLists: [],
            },
          }),
        },
        {
          id: "snapshot-1",
          data: () => ({
            uploadedAt: 1,
            deviceId: "device-1",
            data: {
              routines: [],
              dailyProgress: null,
              dailyHistory: {},
              settings: {},
              pomodoroHistory: {},
              workSessionHistory: {},
              workTemplates: [],
              weightHistory: {},
              journalHistory: {},
              budgetData: { budgets: {}, expenses: {} },
              mealHistory: {},
              presets: [],
              todoLists: [],
            },
          }),
        },
      ],
    } as never);

    await expect(getSyncSnapshots()).resolves.toEqual([
      expect.objectContaining({ id: "snapshot-2", uploadedAt: 2 }),
      expect.objectContaining({ id: "snapshot-1", uploadedAt: 1 }),
    ]);
  });

  it("snapshot を適用するとローカルへ保存する", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: "snapshot-1",
      data: () => ({
        uploadedAt: 1,
        deviceId: "device-1",
        data: {
          routines: [{ id: "r1", title: "朝活" }],
          dailyProgress: null,
          dailyHistory: {},
          settings: {},
          pomodoroHistory: {},
          workSessionHistory: {},
          workTemplates: [],
          weightHistory: {},
          journalHistory: {},
          budgetData: { budgets: {}, expenses: {} },
          mealHistory: {},
          presets: [],
          todoLists: [
            {
              id: "list-1",
              title: "買い物",
              items: [],
              createdAt: "2026-03-10T00:00:00.000Z",
              updatedAt: "2026-03-10T00:00:00.000Z",
            },
          ],
        },
      }),
    } as never);

    await applySyncSnapshot("snapshot-1");

    expect(routineStorage.saveRoutines).toHaveBeenCalledWith([
      { id: "r1", title: "朝活" },
    ]);
    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith([
      expect.objectContaining({ id: "list-1", title: "買い物" }),
    ]);
  });

  it("最新 snapshot を削除した場合は次の履歴を最新として更新する", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "snapshot-latest",
          data: () => ({
            uploadedAt: 20,
            deviceId: "device-2",
            data: {
              routines: [],
              dailyProgress: null,
              dailyHistory: {},
              settings: {},
              pomodoroHistory: {},
              workSessionHistory: {},
              workTemplates: [],
              weightHistory: {},
              journalHistory: {},
              budgetData: { budgets: {}, expenses: {} },
              mealHistory: {},
              presets: [],
              todoLists: [
                {
                  id: "latest",
                  title: "latest",
                  items: [],
                  createdAt: "2026-03-10T00:00:00.000Z",
                  updatedAt: "2026-03-10T00:00:00.000Z",
                },
              ],
            },
          }),
        },
        {
          id: "snapshot-next",
          data: () => ({
            uploadedAt: 10,
            deviceId: "device-1",
            data: {
              routines: [],
              dailyProgress: null,
              dailyHistory: {},
              settings: {},
              pomodoroHistory: {},
              workSessionHistory: {},
              workTemplates: [],
              weightHistory: {},
              journalHistory: {},
              budgetData: { budgets: {}, expenses: {} },
              mealHistory: {},
              presets: [],
              todoLists: [
                {
                  id: "next",
                  title: "next",
                  items: [],
                  createdAt: "2026-03-10T00:00:00.000Z",
                  updatedAt: "2026-03-10T00:00:00.000Z",
                },
              ],
            },
          }),
        },
      ],
    } as never);

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
      }),
    );
  });
});
