import {
  addWorkoutExercise,
  getWorkoutExercises,
  saveWorkoutExercises,
} from "@/features/workout-tracker/storage";
import {
  collectLocalSyncData,
  saveSyncDataToLocal,
  hasLocalData,
} from "../sync/localData";
import {
  collectRecordTransferData,
  RECORD_TRANSFER_FIELDS,
} from "@/features/settings/state/transferGroups/recordGroup";

afterEach(() => localStorage.clear());
it("種目だけのデータを同期・バックアップに含め、復元してもIDを維持する", () => {
  const exercise = addWorkoutExercise({
    name: "スクワット",
    label: "strength",
  });
  const payload = collectLocalSyncData();
  expect(payload.workoutExercises).toEqual([exercise]);
  expect(collectRecordTransferData().workoutExercises).toEqual([exercise]);
  expect(hasLocalData()).toBe(true);
  saveWorkoutExercises([]);
  saveSyncDataToLocal(payload);
  expect(getWorkoutExercises()).toEqual([exercise]);
});
it("古い同期やバックアップでは維持し、明示的な空なら削除する", () => {
  const exercise = addWorkoutExercise({ name: "ジョグ", label: "running" });
  saveSyncDataToLocal({});
  expect(getWorkoutExercises()).toEqual([exercise]);
  for (const field of RECORD_TRANSFER_FIELDS) field.restore({});
  expect(getWorkoutExercises()).toEqual([exercise]);
  saveSyncDataToLocal({ workoutExercises: [] });
  expect(getWorkoutExercises()).toEqual([]);
  for (const field of RECORD_TRANSFER_FIELDS)
    field.restore({ workoutExercises: [exercise] });
  expect(getWorkoutExercises()).toEqual([exercise]);
  for (const field of RECORD_TRANSFER_FIELDS)
    field.restore({ workoutExercises: [] });
  expect(getWorkoutExercises()).toEqual([]);
});

it.each(["workout-exercises", "workout-records"])(
  "同期で%sの保存が失敗したら成功時刻を記録しない",
  async (key) => {
    const { getLocalDataUpdatedAt, setLocalDataUpdatedAt } =
      await import("@/lib/storage/core");
    const local = addWorkoutExercise({ name: "ローカル", label: "strength" });
    setLocalDataUpdatedAt(100);
    const original = Storage.prototype.setItem;
    const spy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(function (this: Storage, target, value) {
        if (target.endsWith(key))
          throw new DOMException("full", "QuotaExceededError");
        original.call(this, target, value);
      });
    try {
      expect(() =>
        saveSyncDataToLocal({
          workoutExercises: [{ ...local, name: "リモート" }],
          workoutRecordHistory: {},
          lastModified: 123456,
        }),
      ).toThrow();
      expect(getLocalDataUpdatedAt()).toBe(100);
      expect(getWorkoutExercises()).toEqual([local]);
    } finally {
      spy.mockRestore();
    }
  },
);

it.each(["workout-exercises", "workout-records"])(
  "バックアップの%s保存失敗で成功・再読み込みを返さない",
  async (key) => {
    const { runImportTransfer } =
      await import("@/features/settings/state/dataTransferStateActions");
    const { importSelectedData, getSelectedTypeLabels } =
      await import("@/features/settings/state/dataTransferHelpers");
    const { EMPTY_TRANSFER_OPTIONS } =
      await import("@/features/settings/state/constants");
    const local = addWorkoutExercise({ name: "ローカル", label: "strength" });
    const original = Storage.prototype.setItem;
    const spy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(function (this: Storage, target, value) {
        if (target.endsWith(key))
          throw new DOMException("full", "QuotaExceededError");
        original.call(this, target, value);
      });
    try {
      const result = await runImportTransfer({
        file: {
          text: async () =>
            JSON.stringify({
              workoutExercises: [{ ...local, name: "復元" }],
              workoutRecordHistory: {},
            }),
        },
        importOptions: { ...EMPTY_TRANSFER_OPTIONS, records: true },
        alertNoSelectionMessage: "",
        buildConfirmImportMessage: () => "restore",
        getSelectedTypeLabels,
        importSelectedData,
        confirmFn: () => true,
      });
      expect(result.status).toBe("error");
      expect(result.shouldReload).toBe(false);
    } finally {
      spy.mockRestore();
    }
  },
);
