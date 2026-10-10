import {
  collectWorkoutSyncData,
  normalizeWorkoutSyncData,
  saveWorkoutSyncData,
  hasWorkoutSyncData,
  type WorkoutSyncData,
} from "../sync/workoutSyncData";
import {
  getWorkoutExercises,
  getWorkoutRecordHistory,
  saveWorkoutExercises,
  saveWorkoutRecordHistory,
} from "@/features/workout-tracker/storage";
jest.mock("@/features/workout-tracker/storage", () => ({
  getWorkoutExercises: jest.fn(),
  getWorkoutRecordHistory: jest.fn(),
  saveWorkoutExercises: jest.fn(),
  saveWorkoutRecordHistory: jest.fn(),
}));
const local: WorkoutSyncData = {
  workoutExercises: [
    {
      id: "one",
      name: "ベンチ",
      label: "strength",
      createdAt: "old",
      updatedAt: "old",
    },
  ],
  workoutRecordHistory: { "2026-10-09": [] },
};
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getWorkoutExercises).mockReturnValue(local.workoutExercises);
  jest
    .mocked(getWorkoutRecordHistory)
    .mockReturnValue(local.workoutRecordHistory);
});
it("種目と記録を収集する", () => {
  expect(collectWorkoutSyncData()).toEqual(local);
});
it.each([
  {},
  { workoutExercises: undefined, workoutRecordHistory: undefined },
  { workoutExercises: null, workoutRecordHistory: null },
])("欠損とnullはローカルを保持する", (input) => {
  expect(normalizeWorkoutSyncData(input as Partial<WorkoutSyncData>)).toEqual(
    local,
  );
});
it("明示された空はローカルで埋めない", () => {
  expect(
    normalizeWorkoutSyncData({
      workoutExercises: [],
      workoutRecordHistory: {},
    }),
  ).toEqual({ workoutExercises: [], workoutRecordHistory: {} });
  expect(getWorkoutExercises).not.toHaveBeenCalled();
  expect(getWorkoutRecordHistory).not.toHaveBeenCalled();
});
it("片方だけ欠損している場合も独立して補完する", () => {
  expect(normalizeWorkoutSyncData({ workoutExercises: [] })).toEqual({
    ...local,
    workoutExercises: [],
  });
});
it("両方を保存し保存失敗を呼び出し元に伝える", () => {
  saveWorkoutSyncData(local);
  expect(saveWorkoutRecordHistory).toHaveBeenCalledWith(
    local.workoutRecordHistory,
  );
  expect(saveWorkoutExercises).toHaveBeenCalledWith(local.workoutExercises);
  jest.mocked(saveWorkoutExercises).mockImplementation(() => {
    throw new Error("full");
  });
  expect(() => saveWorkoutSyncData(local)).toThrow("full");
});
it("記録保存の失敗後に種目を保存しない", () => {
  jest.mocked(saveWorkoutRecordHistory).mockImplementation(() => {
    throw new Error("full");
  });
  expect(() => saveWorkoutSyncData(local)).toThrow("full");
  expect(saveWorkoutExercises).not.toHaveBeenCalled();
});
it("種目だけ・記録だけでも同期データとして扱う", () => {
  expect(hasWorkoutSyncData({ ...local, workoutRecordHistory: {} })).toBe(true);
  expect(hasWorkoutSyncData({ ...local, workoutExercises: [] })).toBe(true);
  expect(
    hasWorkoutSyncData({ workoutRecordHistory: {}, workoutExercises: [] }),
  ).toBe(false);
});
