import type { SyncData, SyncPayload, SyncSnapshot } from "../sync/types";

export const todoListFixture = {
  id: "list-1",
  title: "買い物",
  items: [],
  createdAt: "2026-03-10T00:00:00.000Z",
  updatedAt: "2026-03-10T00:00:00.000Z",
} satisfies SyncPayload["todoLists"][number];

export const routineFixture = {
  id: "r1",
  groupId: "group-1",
  weeklyGoal: {
    targetPerWeek: 3,
    startedAt: "2026-03-09T00:00:00.000Z",
  },
  title: "朝活",
  startTime: "07:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-12T00:00:00.000Z",
  updatedAt: "2026-03-12T00:00:00.000Z",
} satisfies SyncPayload["routines"][number];

export const todoCategoryFixture = {
  id: "todo-cat-1",
  name: "買い物",
  color: "bg-blue-50",
  createdAt: "2026-03-10T00:00:00.000Z",
} satisfies SyncPayload["todoCategories"][number];

export const budgetCategoryFixture = {
  id: "cat-1",
  name: "食料品",
  createdAt: "2026-05-01T00:00:00.000Z",
} satisfies SyncPayload["budgetCategories"][number];

export const budgetIncomeItemFixture = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
} satisfies SyncPayload["budgetIncomeItems"][number];

export const budgetExpenseItemFixture = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed",
  createdAt: "2026-05-01T00:00:00.000Z",
} satisfies SyncPayload["budgetExpenseItems"][number];

export const createSyncPayloadFixture = (
  overrides: Partial<SyncPayload> = {},
): SyncPayload => ({
  routines: [],
  dailyProgress: null,
  dailyHistory: {},
  settings: {
    defaultNotificationMinutes: 0,
    defaultDurationMinutes: 30,
    theme: "auto",
    swipeAction: "delete",
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
  },
  pomodoroHistory: {},
  workSessionHistory: {},
  workTemplates: [],
  weightHistory: {},
  workoutRecordHistory: {},
  workoutExercises: [],
  journalHistory: {},
  weeklyLogHistory: {},
  budgetData: { expenses: {} },
  budgetCategories: [],
  budgetIncomeItems: [],
  budgetExpenseItems: [],
  mealHistory: {},
  presets: [],
  todoLists: [],
  todoCategories: [],
  ...overrides,
});

export const createSyncDataFixture = (
  overrides: Partial<SyncData> = {},
): SyncData => {
  const { lastModified, deviceId, ...payloadOverrides } = overrides;

  return {
    ...createSyncPayloadFixture(payloadOverrides),
    lastModified: lastModified ?? 123,
    deviceId: deviceId ?? "device-1",
  };
};

export const createSyncSnapshotFixture = (
  overrides: Partial<SyncSnapshot> = {},
): SyncSnapshot => ({
  id: "snapshot-1",
  uploadedAt: Date.parse("2026-03-10T10:00:00.000Z"),
  deviceId: "device-1",
  data: createSyncPayloadFixture(),
  ...overrides,
});
