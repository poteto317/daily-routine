import type { SyncPayload } from "../sync/types";
import {
  budgetCategoryFixture,
  createSyncPayloadFixture,
  routineFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";

export const createUploadSyncPayloadFixture = (
  overrides: Partial<SyncPayload> = {},
): SyncPayload =>
  createSyncPayloadFixture({
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
    budgetCategories: [budgetCategoryFixture],
    todoLists: [todoListFixture],
    todoCategories: [todoCategoryFixture],
    ...overrides,
  });
