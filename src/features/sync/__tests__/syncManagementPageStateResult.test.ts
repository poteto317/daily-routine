import type { SyncSnapshot } from "../sync";
import { createSyncManagementPageStateResult } from "../syncManagementPageStateResult";

describe("syncManagementPageStateResult", () => {
  it("sync management page の公開 state を組み立てる", () => {
    const loadSnapshots = jest.fn();
    const handleApply = jest.fn();
    const handleDelete = jest.fn();
    const snapshots: SyncSnapshot[] = [
      {
        id: "snapshot-1",
        uploadedAt: Date.parse("2026-03-10T10:00:00.000Z"),
        deviceId: "device-1",
        data: {
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
          journalHistory: {},
          budgetData: { expenses: {} },
          budgetCategories: [],
          budgetIncomeItems: [],
          budgetExpenseItems: [],
          mealHistory: {},
          presets: [],
          todoLists: [],
        },
      },
    ];

    expect(
      createSyncManagementPageStateResult({
        activeSnapshotId: "snapshot-1",
        error: null,
        isLoading: false,
        loadSnapshots,
        snapshots,
        handleApply,
        handleDelete,
      }),
    ).toEqual({
      activeSnapshotId: "snapshot-1",
      error: null,
      isLoading: false,
      loadSnapshots,
      snapshots,
      handleApply,
      handleDelete,
    });
  });
});
