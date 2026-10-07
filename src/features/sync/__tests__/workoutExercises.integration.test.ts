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
